# FoodRescue API - MongoDB Dataset Import

Project ini adalah tahap awal RESTful API FoodRescue menggunakan Node.js, Express.js, MongoDB Atlas, dan dataset `clean_foodrescue_dataset.csv`.

Fokus project ini:

1. Menghubungkan Express.js ke MongoDB Atlas.
2. Membuat model MongoDB untuk data surplus makanan.
3. Mengimpor dataset CSV ke collection `food_surplus`.
4. Mengecek isi database melalui endpoint sederhana.

## Struktur Folder

```txt
foodrescue-api/
├── config/
│   └── database.js
├── dataset/
│   └── clean_foodrescue_dataset.csv
├── models/
│   └── foodSurplus.js
├── seed/
│   └── importDataset.js
├── .env
├── .env.example
├── package.json
└── server.js
```

## 1. Install Dependency

```bash
npm install
```

## 2. Cek File .env

File `.env` harus berada sejajar dengan `server.js` dan `package.json`.

```env
PORT=5000
MONGO_URI=mongodb+srv://foodrescue_user:password_kamu@cluster0.qwzq2jk.mongodb.net/foodrescue_db?appName=Cluster0
```

Pastikan password dan alamat cluster sesuai dengan MongoDB Atlas kamu.

## 3. Import Dataset ke MongoDB

```bash
npm run import
```

Jika berhasil, terminal akan menampilkan pesan bahwa database MongoDB Atlas berhasil terhubung dan dataset berhasil dimasukkan.

## 4. Jalankan Server

```bash
npm run dev
```

## 5. Cek API

Buka di browser atau Postman:

```txt
http://localhost:5000
```

Cek database:

```txt
http://localhost:5000/api/check-database
```

Lihat data surplus makanan:

```txt
http://localhost:5000/api/food-surplus
```

## Collection MongoDB

Database yang digunakan:

```txt
foodrescue_db
```

Collection yang dibuat:

```txt
food_surplus
```
