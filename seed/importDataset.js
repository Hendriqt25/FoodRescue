const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const dotenv = require("dotenv");

dotenv.config({
    path: path.join(__dirname, "../.env"),
});

const connectDatabase = require("../config/database");
const FoodSurplus = require("../models/foodSurplus");
const User = require("../models/user");

const foodResults = [];
const userResults = [];

const foodDatasetPath = path.join(
    __dirname,
    "../dataset/clean_foodrescue_dataset.csv"
);

const userDatasetPath = path.join(
    __dirname,
    "../dataset/users_foodrescue.csv"
);

const readCsvFile = (filePath, onData) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            reject(new Error(`File tidak ditemukan: ${filePath}`));
            return;
        }

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", onData)
            .on("end", resolve)
            .on("error", reject);
    });
};

const importDataset = async () => {
    try {
        console.log("Cek ENV:", process.env.MONGODB_URI ? "Terbaca" : "Belum terbaca");
        console.log("Path food dataset:", foodDatasetPath);
        console.log("Path user dataset:", userDatasetPath);

        await connectDatabase();

        console.log("Membaca dataset FoodSurplus...");

        await readCsvFile(foodDatasetPath, (row) => {
            foodResults.push({
                donor_id: row.donor_id,
                donor_type: row.donor_type,
                food_type: row.food_type,
                category: row.category,
                quantity_kg: Number(row.quantity_kg),
                expiry_hours: Number(row.expiry_hours),
                lat: Number(row.lat),
                long: Number(row.long),
                city: row.city,
                pickup_status: row.pickup_status,
                receiver_id: row.receiver_id,
                distance_km: Number(row.distance_km),
                pickup_time_hours: Number(row.pickup_time_hours),
                waste_risk: row.waste_risk,
                co2_per_kg: Number(row.co2_per_kg),
                methane_factor: Number(row.methane_factor),
                water_usage: Number(row.water_usage),
                uncertainty_factor: Number(row.uncertainty_factor),
            });
        });

        console.log(`FoodSurplus terbaca: ${foodResults.length}`);

        console.log("Membaca dataset User...");

        await readCsvFile(userDatasetPath, (row) => {
            userResults.push({
                user_id: row.user_id,
                name: row.name,
                email: row.email,
                password: row.password,
                role: row.role,
                donor_id: row.donor_id || null,
            });
        });

        console.log(`User terbaca: ${userResults.length}`);

        if (userResults.length === 0) {
            throw new Error("Dataset user kosong atau CSV tidak terbaca");
        }

        console.log("Menghapus data lama...");
        await FoodSurplus.deleteMany({});
        await User.deleteMany({});

        console.log("Memasukkan data FoodSurplus...");
        await FoodSurplus.insertMany(foodResults);

        console.log("Memasukkan data User...");
        await User.insertMany(userResults);

        console.log("Dataset berhasil masuk ke MongoDB");
        console.log(`Jumlah FoodSurplus: ${foodResults.length}`);
        console.log(`Jumlah User: ${userResults.length}`);

        process.exit(0);
    } catch (error) {
        console.error("Gagal import dataset:", error.message);
        process.exit(1);
    }
};

importDataset();