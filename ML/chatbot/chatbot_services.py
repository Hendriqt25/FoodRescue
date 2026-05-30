import re
import joblib
import pandas as pd
import string
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity

try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

    stemmer = StemmerFactory().create_stemmer()
    stopwords = set(StopWordRemoverFactory().get_stop_words())
except Exception:
    stemmer = None
    stopwords = set()


BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "category_model.pkl"
VECTORIZER_PATH = BASE_DIR / "tfidf_vectorizer.pkl"
PROCESSED_DATASET_PATH = BASE_DIR / "faq_dataset_processed.csv"
RAW_DATASET_PATH = BASE_DIR / "faq_dataset_augmented.csv"

category_model = joblib.load(MODEL_PATH)
tfidf_vectorizer = joblib.load(VECTORIZER_PATH)


OUT_OF_CONTEXT_RESPONSE = (
    "Mohon maaf, saya tidak dapat memahami pesan Anda. "
    "Bisakah berikan lebih banyak detail atau jelaskan lebih lanjut "
    "tentang apa yang kamu butuhkan? Terima kasih!"
)


def validate_input(text):
    if not isinstance(text, str):
        return False, "Input harus berupa teks."

    text = text.strip()

    if len(text) == 0:
        return False, OUT_OF_CONTEXT_RESPONSE

    # Ini penting supaya input seperti "anu", "hey", "ok", "a" tidak dipaksa masuk kategori donasi.
    if len(text.split()) < 2:
        return False, OUT_OF_CONTEXT_RESPONSE

    if re.fullmatch(r"[^a-zA-Z0-9\s]+", text):
        return False, OUT_OF_CONTEXT_RESPONSE

    return True, None


def contains_too_many_emojis(text):
    emoji_count = len(re.findall(r"[\U00010000-\U0010ffff]", text))
    return emoji_count >= 3


def is_repetitive(text):
    text = text.lower().strip()

    if len(set(text.replace(" ", ""))) <= 2:
        return True

    if re.search(r"(.)\1{5,}", text):
        return True

    return False


def is_gibberish(text):
    text = text.lower()

    vowels = len(re.findall(r"[aiueo]", text))
    consonants = len(re.findall(r"[bcdfghjklmnpqrstvwxyz]", text))

    total = vowels + consonants

    if total == 0:
        return True

    vowel_ratio = vowels / total

    if len(text) > 6 and vowel_ratio < 0.15:
        return True

    return False


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


def load_dataset():
    if PROCESSED_DATASET_PATH.exists():
        data = pd.read_csv(PROCESSED_DATASET_PATH)
    elif RAW_DATASET_PATH.exists():
        data = pd.read_csv(RAW_DATASET_PATH)
        data["clean_question"] = data["question"].apply(clean_text)
    else:
        raise FileNotFoundError(
            "Dataset chatbot tidak ditemukan. "
            "Letakkan faq_dataset_augmented.csv atau faq_dataset_processed.csv di folder chatbot."
        )

    required_columns = {"question", "answer", "category", "clean_question"}
    if not required_columns.issubset(data.columns):
        raise ValueError(
            "Dataset chatbot wajib punya kolom: question, answer, category, clean_question"
        )

    return data.dropna(subset=["question", "answer", "category", "clean_question"]).copy()


faq_df = load_dataset()


def get_response(user_input, debug=False):
    valid, error_message = validate_input(user_input)

    if not valid:
        return {
            "category": None,
            "confidence": 0.0,
            "matched_question": None,
            "response": error_message,
            "is_context": False,
        }

    if (
        is_gibberish(user_input)
        or contains_too_many_emojis(user_input)
        or is_repetitive(user_input)
    ):
        return {
            "category": None,
            "confidence": 0.0,
            "matched_question": None,
            "response": OUT_OF_CONTEXT_RESPONSE,
            "is_context": False,
        }

    cleaned = clean_text(user_input)
    user_vector = tfidf_vectorizer.transform([cleaned])

    # 1. Prediksi kategori dulu untuk mempersempit area pencarian.
    predicted_category = category_model.predict(user_vector)[0]

    category_df = faq_df[faq_df["category"] == predicted_category].copy()

    if category_df.empty:
        return {
            "category": None,
            "confidence": 0.0,
            "matched_question": None,
            "response": "Kategori tidak ditemukan.",
            "is_context": False,
        }

    # 2. Di dalam kategori itu, cari pertanyaan paling mirip.
    category_vectors = tfidf_vectorizer.transform(category_df["clean_question"])
    similarity = cosine_similarity(user_vector, category_vectors)

    if similarity.size == 0:
        return {
            "category": None,
            "confidence": 0.0,
            "matched_question": None,
            "response": "FAQ tidak ditemukan.",
            "is_context": False,
        }

    index = similarity.argmax()
    score = float(similarity[0][index])

    matched_row = category_df.iloc[index]

    # 3. Ambil confidence kategori dari LinearSVC.
    try:
        decision_scores = category_model.decision_function(user_vector)
        classifier_confidence = float(max(decision_scores[0]))
        classifier_confidence = min(max(classifier_confidence, 0), 1)
    except Exception:
        classifier_confidence = 0.0

    final_score = (0.7 * score) + (0.3 * classifier_confidence)

    # Threshold ini yang mencegah input aneh seperti "anu" dijawab donasi.
    if score < 0.4 or final_score < 0.4:
        return {
            "category": None,
            "confidence": final_score,
            "matched_question": str(matched_row["question"]),
            "response": OUT_OF_CONTEXT_RESPONSE,
            "is_context": False,
        }

    if debug:
        print("=" * 50)
        print("Original Input:", user_input)
        print("Cleaned Input:", cleaned)
        print("Predicted Category:", predicted_category)
        print("Similarity Score:", score)
        print("Classifier Confidence:", classifier_confidence)
        print("Final Score:", final_score)
        print("Matched Question:", matched_row["question"])
        print("=" * 50)

    return {
        "category": str(predicted_category),
        "confidence": final_score,
        "matched_question": str(matched_row["question"]),
        "response": str(matched_row["answer"]).strip(),
        "is_context": True,
    }


def chatbot_response(data):
    user_message = data.message.strip()

    result = get_response(user_message, debug=False)

    return {
        "user_message": user_message,
        "category": result["category"],
        "confidence": result["confidence"],
        "matched_question": result["matched_question"],
        "response": result["response"],
        "is_context": result["is_context"],
    }
