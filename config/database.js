const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDatabase = async () => {
  try {

    if (!process.env.MONGO_URI) {
      throw new Error("Belum terbaca. Cek file .env");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      family: 4
    });

    console.log("Database MongoDB Atlas berhasil terhubung");
  } catch (error) {
    console.error("Koneksi database gagal:", error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;