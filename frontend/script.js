const API_BASE_URL = "http://localhost:5000/api";

const databaseStatus = document.getElementById("databaseStatus");
const userTableBody = document.getElementById("userTableBody");
const foodTableBody = document.getElementById("foodTableBody");

async function checkDatabase() {
    try {
        databaseStatus.innerHTML = "Sedang mengecek database...";

        const response = await fetch(`${API_BASE_URL}/check-database`);
        const result = await response.json();

        if (result.success) {
        databaseStatus.innerHTML = `
            <strong>Status:</strong> ${result.message}<br>
            <strong>Database:</strong> ${result.database}<br>
            <strong>Collection:</strong> ${result.collection}<br>
            <strong>Total Data:</strong> ${result.total_data}
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

    async function getUsers() {
    try {
        userTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty">Sedang mengambil data user...</td>
        </tr>
        `;

        const response = await fetch(`${API_BASE_URL}/users`);
        const result = await response.json();

        if (!result.success || result.data.length === 0) {
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

        if (!result.success || result.data.length === 0) {
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