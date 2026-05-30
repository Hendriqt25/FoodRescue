const API_BASE_URL = "http://localhost:5000/api";

let currentUser = JSON.parse(localStorage.getItem("foodrescue_user")) || null;
let cachedFoodData = [];

document.addEventListener("DOMContentLoaded", () => {
  setupForms();
  if (currentUser) openDashboard(currentUser);
});

function setupForms() {
  document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
  document.getElementById("registerForm")?.addEventListener("submit", handleRegister);
  document.getElementById("predictionForm")?.addEventListener("submit", handlePrediction);

  document.getElementById("registerRole")?.addEventListener("change", () => {
    const isDonor = document.getElementById("registerRole").value === "pendonor";
    document.getElementById("donorIdLabel").classList.toggle("hidden", !isDonor);
    document.getElementById("registerDonorId").classList.toggle("hidden", !isDonor);
  });
}

function showAuthTab(type) {
  document.getElementById("loginTab").classList.toggle("active", type === "login");
  document.getElementById("registerTab").classList.toggle("active", type === "register");
  document.getElementById("loginForm").classList.toggle("hidden", type !== "login");
  document.getElementById("registerForm").classList.toggle("hidden", type !== "register");
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(result.message || "Email atau password salah.");
      return;
    }

    const user = result.user || result.data || result.result;
    saveUser(user);
  } catch (error) {
    alert(`Gagal terhubung ke server: ${error.message}`);
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const role = document.getElementById("registerRole").value;
  const payload = {
    name: document.getElementById("registerName").value.trim(),
    email: document.getElementById("registerEmail").value.trim(),
    password: document.getElementById("registerPassword").value.trim(),
    role,
    donor_id: role === "pendonor" ? document.getElementById("registerDonorId").value.trim() : null,
  };

  if (role === "pendonor" && !payload.donor_id) {
    alert("Donor ID wajib diisi untuk pendonor.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(result.message || "Register gagal.");
      return;
    }

    alert("Register berhasil. Silakan login.");
    showAuthTab("login");
    document.getElementById("registerForm").reset();
  } catch (error) {
    alert(`Gagal terhubung ke server: ${error.message}`);
  }
}

function saveUser(user) {
  currentUser = {
    user_id: user.user_id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    donor_id: user.donor_id || null,
  };

  localStorage.setItem("foodrescue_user", JSON.stringify(currentUser));
  openDashboard(currentUser);
}

function openDashboard(user) {
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("dashboardPage").classList.remove("hidden");
  document.getElementById("currentUserName").textContent = user.name;
  document.getElementById("currentUserEmail").textContent = user.email;
  document.getElementById("userRoleBadge").textContent = user.role;
  document.getElementById("welcomeTitle").textContent = `Halo, ${user.name}`;
  document.getElementById("welcomeSubtitle").textContent = getSubtitleByRole(user.role);
  renderProfile(user);
  loadFoodSurplus();

  if (user.role === "penerima") showMenu("recommendation");
  else showMenu("overview");
}

function getSubtitleByRole(role) {
  if (role === "penerima") return "Lihat rekomendasi tempat donasi makanan paling cocok.";
  if (role === "pendonor") return "Pantau data donasi makanan berdasarkan donor ID kamu.";
  if (role === "admin" || role === "superadmin") return "Kelola monitoring, prediksi, rekomendasi, dan chatbot.";
  return "Dashboard FoodRescue.";
}

function logout() {
  localStorage.removeItem("foodrescue_user");
  currentUser = null;
  document.getElementById("dashboardPage").classList.add("hidden");
  document.getElementById("authPage").classList.remove("hidden");
}

function showMenu(menu) {
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll(".page-section").forEach((section) => section.classList.add("hidden"));

  const navMap = { overview: 0, recommendation: 1, prediction: 2, chatbot: 3, profile: 4 };
  document.querySelectorAll(".nav-item")[navMap[menu]].classList.add("active");
  document.getElementById(`${menu}Section`).classList.remove("hidden");

  if (menu === "recommendation") loadRecommendations();
}

async function loadFoodSurplus() {
  try {
    const response = await fetch(`${API_BASE_URL}/food-surplus`);
    const result = await response.json();
    const data = result.data || result.result || result.foodSurplus || result || [];
    cachedFoodData = Array.isArray(data) ? data : [];
  } catch (error) {
    cachedFoodData = [];
  }

  renderFoodTable(cachedFoodData);
  renderStats(cachedFoodData);
}

function renderFoodTable(data) {
  let filtered = [...data];

  if (currentUser?.role === "pendonor" && currentUser?.donor_id) {
    filtered = filtered.filter((item) => item.donor_id === currentUser.donor_id);
  }

  const tbody = document.getElementById("foodTableBody");

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7">Data belum tersedia.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.slice(0, 20).map((item) => `
    <tr>
      <td>${item.donor_id || "-"}</td>
      <td>${item.food_type || "-"}</td>
      <td>${item.category || "-"}</td>
      <td>${item.quantity_kg || 0} kg</td>
      <td>${item.expiry_hours || 0} jam</td>
      <td>${item.distance_km || 0} km</td>
      <td>${item.pickup_status || "-"}</td>
    </tr>
  `).join("");
}

function renderStats(data) {
  const total = data.length;
  const avgDistance = total ? data.reduce((sum, item) => sum + Number(item.distance_km || 0), 0) / total : 0;
  const highPriority = data.filter((item) => Number(item.expiry_hours || 0) <= 8 && Number(item.distance_km || 0) <= 5).length;
  document.getElementById("totalDonasi").textContent = total;
  document.getElementById("avgDistance").textContent = `${avgDistance.toFixed(1)} km`;
  document.getElementById("highPriorityCount").textContent = highPriority;
}

function loadRecommendations() {
  let data = cachedFoodData.length ? [...cachedFoodData] : [];
  const city = document.getElementById("filterCity").value.trim().toLowerCase();
  const category = document.getElementById("filterCategory").value.trim().toLowerCase();

  if (city) data = data.filter((item) => String(item.city || "").toLowerCase().includes(city));
  if (category) data = data.filter((item) => String(item.category || "").toLowerCase().includes(category));

  data = data
    .map((item) => ({ ...item, recommendation_score: calculateRecommendationScore(item) }))
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
    .slice(0, 9);

  renderRecommendations(data);
}

function calculateRecommendationScore(item) {
  const distance = Number(item.distance_km || 10);
  const expiry = Number(item.expiry_hours || 24);
  const quantity = Number(item.quantity_kg || 1);
  const distanceScore = Math.max(0, 1 - distance / 20);
  const expiryScore = Math.max(0, 1 - expiry / 48);
  const quantityScore = Math.min(quantity / 50, 1);
  return distanceScore * 0.5 + expiryScore * 0.3 + quantityScore * 0.2;
}

function renderRecommendations(data) {
  const container = document.getElementById("recommendationList");

  if (!data.length) {
    container.innerHTML = `<div class="empty-state">Belum ada rekomendasi yang cocok dari data MongoDB.</div>`;
    return;
  }

  container.innerHTML = data.map((item, index) => {
    const score = Math.round((item.recommendation_score || 0) * 100);
    return `
      <article class="reco-card">
        <div class="reco-top">
          <div>
            <h3>${index + 1}. ${item.donor_type || "Tempat Donasi"}</h3>
            <p>${item.food_type || "-"} • ${item.city || "-"}</p>
          </div>
          <span class="reco-badge">${score}% cocok</span>
        </div>
        <div class="reco-metrics">
          <div><span>Jarak</span><strong>${Number(item.distance_km || 0).toFixed(1)} km</strong></div>
          <div><span>Expired</span><strong>${item.expiry_hours || 0} jam</strong></div>
          <div><span>Jumlah</span><strong>${item.quantity_kg || 0} kg</strong></div>
        </div>
        <p>Direkomendasikan berdasarkan jarak, waktu kedaluwarsa, dan jumlah makanan.</p>
      </article>
    `;
  }).join("");
}

async function handlePrediction(event) {
  event.preventDefault();

  const payload = {
    distance_km: Number(document.getElementById("distance_km").value),
    quantity_kg: Number(document.getElementById("quantity_kg").value),
    expiry_hours: Number(document.getElementById("expiry_hours").value),
    pickup_time_hours: Number(document.getElementById("pickup_time_hours").value),
    co2_per_kg: Number(document.getElementById("co2_per_kg").value),
    methane_factor: Number(document.getElementById("methane_factor").value),
    water_usage: Number(document.getElementById("water_usage").value),
    uncertainty_factor: Number(document.getElementById("uncertainty_factor").value),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/ai/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(result.message || "Prediksi gagal.");
      return;
    }

    const data = result.result?.result || result.result || result.data || result;
    renderPredictionResult(data, payload);
  } catch (error) {
    alert(`Gagal menghubungi server prediksi: ${error.message}`);
  }
}

function renderPredictionResult(data, input) {
  const scoreRaw = Number(data.prediction_score ?? data.score ?? data.prediction ?? 0);
  const normalizedScore = scoreRaw > 1 ? scoreRaw / 100 : scoreRaw;
  const percent = Math.round(normalizedScore * 100);
  const priority = data.priority || (normalizedScore >= 0.75 ? "Tinggi" : normalizedScore >= 0.5 ? "Sedang" : "Rendah");
  const recommendation = data.recommendation || getRecommendationText(normalizedScore, input.distance_km);
  document.getElementById("predictionPriority").textContent = `Prioritas ${priority}`;
  document.getElementById("predictionScore").textContent = `${percent}%`;
  document.getElementById("predictionRecommendation").textContent = recommendation;
  document.getElementById("resultDistance").textContent = `${input.distance_km} km`;
  document.getElementById("resultExpiry").textContent = `${input.expiry_hours} jam`;
  document.getElementById("resultQuantity").textContent = `${input.quantity_kg} kg`;
}

function getRecommendationText(score, distance) {
  if (score >= 0.75 && distance <= 5) return "Makanan sangat direkomendasikan untuk segera didistribusikan karena prioritas tinggi dan jarak penerima dekat.";
  if (score >= 0.75 && distance > 5) return "Makanan prioritas tinggi, tetapi sebaiknya dicari penerima yang lebih dekat.";
  if (score >= 0.5) return "Makanan masih layak diproses untuk distribusi, namun tetap pertimbangkan jarak dan waktu kedaluwarsa.";
  return "Prioritas distribusi rendah, perlu pengecekan ulang kondisi makanan sebelum disalurkan.";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getChatbotPayload(result) {
  return result?.result?.result || result?.result || result?.data || result || {};
}

function addChatMessage(sender, text, category = null, confidence = null) {
  const chatbotResult = document.getElementById("chatbotResult");
  const isUser = sender === "user";
  const row = document.createElement("div");
  row.className = `message-row ${isUser ? "user" : "bot"}`;

  const confidenceText = confidence !== null && confidence !== undefined
    ? `<span class="chat-confidence">Confidence: ${Math.round(Number(confidence) * 100)}%</span>`
    : "";

  row.innerHTML = `
    <div class="chat-avatar ${isUser ? "user-avatar" : "bot-avatar"}">${isUser ? "U" : "AI"}</div>
    <div class="message-bubble ${isUser ? "user-bubble" : "bot-bubble"}">
      <div class="message-name">${isUser ? "Kamu" : "FoodRescue AI"}</div>
      <p>${escapeHtml(text)}</p>
      ${!isUser && category ? `<div class="chat-meta"><span class="chat-category">Kategori: ${escapeHtml(category)}</span>${confidenceText}</div>` : ""}
    </div>
  `;

  chatbotResult.appendChild(row);
  chatbotResult.scrollTop = chatbotResult.scrollHeight;
}

function showTypingLoading() {
  const chatbotResult = document.getElementById("chatbotResult");
  const loadingRow = document.createElement("div");
  loadingRow.className = "message-row bot loading-message";
  loadingRow.innerHTML = `
    <div class="chat-avatar bot-avatar">AI</div>
    <div class="message-bubble bot-bubble">
      <div class="typing-dot"><span></span><span></span><span></span></div>
    </div>
  `;
  chatbotResult.appendChild(loadingRow);
  chatbotResult.scrollTop = chatbotResult.scrollHeight;
  return loadingRow;
}

function useSuggestion(text) {
  const chatMessage = document.getElementById("chatMessage");
  chatMessage.value = text;
  chatMessage.focus();
}

async function sendChatbotMessage() {
  const chatMessage = document.getElementById("chatMessage");
  const message = chatMessage.value.trim();

  if (!message) {
    addChatMessage("bot", "Pesan chatbot wajib diisi dulu ya.");
    return;
  }

  addChatMessage("user", message);
  chatMessage.value = "";

  const loadingRow = showTypingLoading();

  try {
    const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const result = await response.json();
    loadingRow.remove();

    if (!response.ok || !result.success) {
      addChatMessage("bot", result.message || "Chatbot gagal merespons.");
      return;
    }

    const chatbotData = getChatbotPayload(result);
    const botResponse = chatbotData.response || chatbotData.answer || "Maaf, saya belum punya jawaban untuk pertanyaan itu.";
    addChatMessage("bot", botResponse, chatbotData.category || null, chatbotData.confidence ?? null);
  } catch (error) {
    loadingRow.remove();
    addChatMessage("bot", `Gagal menghubungi backend chatbot: ${error.message}`);
  }
}

document.addEventListener("keydown", (event) => {
  const chatMessage = document.getElementById("chatMessage");
  if (chatMessage && document.activeElement === chatMessage && event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendChatbotMessage();
  }
});

function renderProfile(user) {
  document.getElementById("profileDetail").innerHTML = `
    <p><strong>User ID:</strong> ${user.user_id || "-"}</p>
    <p><strong>Nama:</strong> ${user.name || "-"}</p>
    <p><strong>Email:</strong> ${user.email || "-"}</p>
    <p><strong>Role:</strong> ${user.role || "-"}</p>
    <p><strong>Donor ID:</strong> ${user.donor_id || "-"}</p>
  `;
}
