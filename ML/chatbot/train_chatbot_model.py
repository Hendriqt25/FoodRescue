import re
import string
import joblib
import pandas as pd

from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, classification_report

try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

    stemmer = StemmerFactory().create_stemmer()
    stopwords = set(StopWordRemoverFactory().get_stop_words())
except Exception:
    stemmer = None
    stopwords = set()


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "faq_dataset_augmented.csv"


def clean_text(text):
    if not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = text.replace("food rescue", "foodrescue")

    typo_dict = {
        "food": "foodrescue",
        "gmn": "bagaimana",
        "bgmn": "bagaimana",
        "donsi": "donasi",
        "mknn": "makanan",
        "mkn": "makanan",
        "mknan": "makanan",
        "yg": "yang",
        "dr": "dari",
        "utk": "untuk",
        "tdk": "tidak",
        "ga": "tidak",
        "gak": "tidak",
        "sy": "saya",
        "spa": "siapa",
        "mnfaat": "manfaat",
        "tujun": "tujuan",
        "fdr": "foodrescue",
    }

    synonyms = {
        "sumbang": "donasi",
        "menyumbang": "donasi",
        "donatur": "donasi",
        "ambil": "pickup",
        "pengambilan": "pickup",
        "jemput": "pickup",
        "mengambil": "pickup",
        "mengantar": "pickup",
        "antar": "pickup",
        "kirim": "pickup",
        "volunteer": "relawan",
        "ngo": "yayasan",
        "kegunaan": "manfaat",
        "fungsi": "manfaat",
        "keuntungan": "manfaat",
        "tujuan": "manfaat",
        "visi": "manfaat",
        "basi": "expired",
        "kadaluarsa": "expired",
    }

    words = text.split()
    words = [typo_dict.get(word, word) for word in words]
    words = [word for word in words if word not in stopwords]
    words = [synonyms.get(word, word) for word in words]

    text = " ".join(words)

    if stemmer is not None:
        text = stemmer.stem(text)

    text = re.sub(r"\s+", " ", text).strip()
    return text


def main():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset tidak ditemukan: {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)

    required_columns = {"question", "answer", "category"}
    if not required_columns.issubset(df.columns):
        raise ValueError("Dataset wajib punya kolom: question, answer, category")

    df = df.dropna(subset=["question", "answer", "category"]).copy()
    df["clean_question"] = df["question"].apply(clean_text)

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=2000,
        min_df=1,
        max_df=0.95,
        sublinear_tf=True,
        lowercase=False,
        strip_accents="unicode",
        token_pattern=r"(?u)\b\w+\b",
    )

    X = vectorizer.fit_transform(df["clean_question"])
    y = df["category"]

    model = LinearSVC(C=1.0, max_iter=5000)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    print("Jumlah data:", len(df))
    print("Distribusi kategori:")
    print(df["category"].value_counts())
    print("\nAccuracy:", accuracy_score(y_test, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    scores = cross_val_score(model, X, y, cv=5)
    print("Cross Validation:", scores)
    print("Mean CV Score:", scores.mean())

    joblib.dump(model, BASE_DIR / "category_model.pkl")
    joblib.dump(vectorizer, BASE_DIR / "tfidf_vectorizer.pkl")

    # Simpan dataset yang sudah dibersihkan agar chatbot_services tidak perlu hardcode QA.
    df[["question", "answer", "category", "clean_question"]].to_csv(
        BASE_DIR / "faq_dataset_processed.csv",
        index=False,
        encoding="utf-8",
    )

    print("\nModel berhasil disimpan:")
    print("- category_model.pkl")
    print("- tfidf_vectorizer.pkl")
    print("- faq_dataset_processed.csv")


if __name__ == "__main__":
    main()
