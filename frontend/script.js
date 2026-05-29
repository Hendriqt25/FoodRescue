const API_BASE_URL = "http://localhost:5000/api";

const databaseStatus = document.getElementById("databaseStatus");
const userTableBody = document.getElementById("userTableBody");
const foodTableBody = document.getElementById("foodTableBody");
const predictionForm = document.getElementById("predictionForm");
const predictionResult = document.getElementById("predictionResult");
const chatbotResult = document.getElementById("chatbotResult");
const chatMessage = document.getElementById("chatMessage");

function formatJson(data) {
    return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

function setLoading(element, message) {
    element.classList.remove("success", "error", "muted");
    element.classList.add("loading");
    element.innerHTML = message;
}

function setSuccess(element, message) {
    element.classList.remove("loading", "error", "muted");
    element.classList.add("success");
    element.innerHTML = message;
}

function setError(element, message) {
    element.classList.remove("loading", "success", "muted");
    element.classList.add("error");
    element.innerHTML = message;
}

async function checkDatabase() {
    try {
        databaseStatus.innerHTML = "Sedang mengecek database...";

        const response = await fetch(`${API_BASE_URL}/check-database`);
        const result = await response.json();

        if (result.success) {
            databaseStatus.innerHTML = `
                <strong>Status:</strong> ${result.message}<br>
                <strong>Database:</strong> ${result.database || "-"}<br>
                <strong>Collection:</strong> ${result.collection || "-"}<br>
                <strong>Total Data:</strong> ${result.total_data ?? "-"}
            `;
        } else {
            databaseStatus.innerHTML = `
                <strong>Status:</strong> Gagal<br>
                <strong>Error:</strong> ${result.message}
            `;
        }
    } catch (error) {
        databaseStatus.innerHTML = `
            <strong>Status:</strong> Gagal menghubungi API<br>
            <strong>Error:</strong> ${error.message}
        `;
    }
}

async function predictFoodRescue() {
    try {
        const formData = new FormData(predictionForm);
        const payload = {};

        for (const [key, value] of formData.entries()) {
            if (value === "") {
                setError(predictionResult, `Field <b>${key}</b> wajib diisi.`);
                return;
            }
            payload[key] = Number(value);
        }

        setLoading(predictionResult, "Sedang memproses prediksi AI...");

        const response = await fetch(`${API_BASE_URL}/ai/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            setError(predictionResult, `Prediksi gagal:<br>${formatJson(result)}`);
            return;
        }

        const prediction = result?.result?.result?.prediction || result?.result?.prediction || result?.data?.prediction || null;

        setSuccess(predictionResult, `
            <h3>Prediksi Berhasil</h3>
            ${prediction ? `<p><strong>Output Model:</strong> ${JSON.stringify(prediction)}</p>` : ""}
            <details open>
                <summary>Detail Response</summary>
                ${formatJson(result)}
            </details>
        `);
    } catch (error) {
        setError(predictionResult, `Gagal menghubungi backend prediksi: ${error.message}`);
    }
}

function fillPredictionSample() {
    const sample = {
        distance_km: 3,
        expiry_hours: 12,
        pickup_time_hours: 2,
        urgency_score: 4,
        quantity_kg: 10,
        food_density_per_km: 3.3,
        co2_per_kg: 2.5,
        methane_factor: 0.8,
        water_usage: 2500,
        donor_type_encoded: 1,
        category_encoded: 2,
    };

    Object.entries(sample).forEach(([key, value]) => {
        const input = predictionForm.elements[key];
        if (input) input.value = value;
    });

    predictionResult.className = "result-box muted";
    predictionResult.innerHTML = "Contoh data sudah dimasukkan. Klik <b>Jalankan Prediksi AI</b> untuk testing.";
}

function resetPredictionForm() {
    predictionForm.reset();
    predictionResult.className = "result-box muted";
    predictionResult.innerHTML = "Hasil prediksi belum tersedia.";
}

async function sendChatbotMessage() {
    try {
        const message = chatMessage.value.trim();

        if (!message) {
            setError(chatbotResult, "Pesan chatbot wajib diisi.");
            return;
        }

        setLoading(chatbotResult, "Sedang mengirim pesan ke chatbot AI...");

        const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            setError(chatbotResult, `Chatbot gagal:<br>${formatJson(result)}`);
            return;
        }

        const category = result?.result?.result?.category || result?.result?.category || result?.data?.category || null;

        setSuccess(chatbotResult, `
            <h3>Chatbot Berhasil Merespons</h3>
            ${category ? `<p><strong>Kategori:</strong> ${category}</p>` : ""}
            <details open>
                <summary>Detail Response</summary>
                ${formatJson(result)}
            </details>
        `);
    } catch (error) {
        setError(chatbotResult, `Gagal menghubungi backend chatbot: ${error.message}`);
    }
}

async function getUsers() {
    try {
        userTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty">Sedang mengambil data user...</td>
            </tr>
        `;

        const response = await fetch(`${API_BASE_URL}/users`);
        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
            userTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty">Data user tidak tersedia</td>
                </tr>
            `;
            return;
        }

        userTableBody.innerHTML = "";

        result.data.forEach((user) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.name || "-"}</td>
                <td>${user.email || "-"}</td>
                <td>${user.role || "-"}</td>
                <td>${user.user_type || "-"}</td>
                <td>${user.city || "-"}</td>
                <td>
                    ${
                        user.is_verified
                            ? `<span class="badge badge-success">Terverifikasi</span>`
                            : `<span class="badge badge-warning">Belum</span>`
                    }
                </td>
            `;

            userTableBody.appendChild(row);
        });
    } catch (error) {
        userTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty">Gagal mengambil data user: ${error.message}</td>
            </tr>
        `;
    }
}

async function getFoodSurplus() {
    try {
        foodTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty">Sedang mengambil data makanan...</td>
            </tr>
        `;

        const response = await fetch(`${API_BASE_URL}/food-surplus`);
        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
            foodTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty">Data makanan tidak tersedia</td>
                </tr>
            `;
            return;
        }

        foodTableBody.innerHTML = "";

        result.data.forEach((food) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${food.donor_id || "-"}</td>
                <td>${food.donor_type || "-"}</td>
                <td>${food.food_type || "-"}</td>
                <td>${food.category || "-"}</td>
                <td>${food.quantity_kg || "-"}</td>
                <td>${food.city || "-"}</td>
                <td>${food.pickup_status || "-"}</td>
            `;

            foodTableBody.appendChild(row);
        });
    } catch (error) {
        foodTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty">Gagal mengambil data makanan: ${error.message}</td>
            </tr>
        `;
    }
}
