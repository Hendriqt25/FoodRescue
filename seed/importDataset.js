const fs = require("fs");
const csv = require("csv-parser");
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");
const FoodSurplus = require("../models/foodSurplus");

dotenv.config();

const results = [];

const importDataset = async () => {
    try {
        await connectDatabase();

        fs.createReadStream("dataset/clean_foodrescue_dataset.csv")
        .pipe(csv())
        .on("data", (row) => {
            results.push({
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
            uncertainty_factor: Number(row.uncertainty_factor)
            });
        })
        .on("end", async () => {
            await FoodSurplus.deleteMany();

            await FoodSurplus.insertMany(results);

            console.log("Dataset berhasil dimasukkan ke MongoDB Atlas");
            console.log(`Jumlah data: ${results.length}`);

            process.exit();
        });
    } catch (error) {
        console.error("Gagal import dataset:", error.message);
        process.exit(1);
    }
};

importDataset();
const fs = require("fs");
const csv = require("csv-parser");
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");
const FoodSurplus = require("../models/foodSurplus");

dotenv.config();

const results = [];

const importDataset = async () => {
    try {
        await connectDatabase();

        fs.createReadStream("dataset/clean_foodrescue_dataset.csv")
        .pipe(csv())
        .on("data", (row) => {
            results.push({
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
            uncertainty_factor: Number(row.uncertainty_factor)
            });
        })
        .on("end", async () => {
            await FoodSurplus.deleteMany();

            await FoodSurplus.insertMany(results);

            console.log("Dataset berhasil dimasukkan ke MongoDB Atlas");
            console.log(`Jumlah data: ${results.length}`);

            process.exit();
        });
    } catch (error) {
        console.error("Gagal import dataset:", error.message);
        process.exit(1);
    }
};

importDataset();
