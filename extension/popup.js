const API_BASE = "https://www.viziai.app";

const ERROR_MESSAGES = {
  "Invalid or expired API key": "Geçersiz veya süresi dolmuş API anahtarı",
  "Profile not found": "Profil bulunamadı",
  "Verification failed": "Doğrulama başarısız oldu",
};

const apiKeyInput = document.getElementById("apiKey");
const testBtn = document.getElementById("testBtn");
const testResult = document.getElementById("testResult");
const setupSection = document.getElementById("setup");
const connectedSection = document.getElementById("connected");
const profileNameEl = document.getElementById("profileName");
const disconnectBtn = document.getElementById("disconnectBtn");

// On load: check if key exists
chrome.storage.local.get(["apiKey", "profileName"], (data) => {
  if (data.apiKey && data.profileName) {
    showConnected(data.profileName);
  }
});

// Test connection
testBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  if (!key) return;
  if (!key.startsWith("viz_")) {
    showResult("error", "Anahtar viz_ ile başlamalıdır");
    return;
  }

  testBtn.disabled = true;
  testBtn.textContent = "Test ediliyor…";
  testResult.classList.add("hidden");

  try {
    const res = await fetch(`${API_BASE}/api/settings/api-keys/verify`, {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = ERROR_MESSAGES[data.error] || "Geçersiz API anahtarı";
      showResult("error", msg);
      testBtn.disabled = false;
      testBtn.textContent = "Bağlantıyı Test Et";
      return;
    }

    const data = await res.json();

    // Save key and profile info
    await chrome.storage.local.set({
      apiKey: key,
      profileName: data.profileName,
      profileId: data.profileId,
    });

    showConnected(data.profileName);
  } catch (err) {
    showResult("error", "Bağlantı hatası: " + err.message);
    testBtn.disabled = false;
    testBtn.textContent = "Bağlantıyı Test Et";
  }
});

// Disconnect
disconnectBtn.addEventListener("click", async () => {
  await chrome.storage.local.remove(["apiKey", "profileName", "profileId"]);
  connectedSection.classList.add("hidden");
  setupSection.classList.remove("hidden");
  apiKeyInput.value = "";
  testResult.classList.add("hidden");
});

function showConnected(profileName) {
  setupSection.classList.add("hidden");
  connectedSection.classList.remove("hidden");
  profileNameEl.textContent = profileName;
}

function showResult(type, message) {
  testResult.textContent = message;
  testResult.className = `result result-${type}`;
  testResult.classList.remove("hidden");
}
