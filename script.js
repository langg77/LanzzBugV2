// === Elemen DOM ===
const popupSendBug = document.getElementById("popupSendBug");
const popupError = document.getElementById("popupError");
const popupConfirmDelete = document.getElementById("popupConfirmDelete");
const popupTo = document.getElementById("popupTo");
const popupBugType = document.getElementById("popupBugType");
const popupErrorText = document.getElementById("popupErrorText");
const waitText = document.getElementById("waitText");
const inputNumber = document.getElementById("number");
const bugTypeSelect = document.getElementById("bugType");
const historyBox = document.getElementById("historyBox");
const historyList = document.getElementById("historyList");
const historyIcon = document.querySelector(".history-icon");
const sendBtn = document.getElementById("sendBug");
const botStatus = document.getElementById("botStatus");
const clearHistoryBtn = document.getElementById("clearHistory");
const confirmYesBtn = document.getElementById("confirmYes");
const infoBtn = document.getElementById("infoBtn");
const infoPopup = document.getElementById("infoPopup");
const loginScreen = document.getElementById("loginScreen");
const attackMenu = document.getElementById("attackContainer");

// === Data ===
let history = JSON.parse(localStorage.getItem("bugHistory")) || [];
let bugSpamCount = 0;
let isBotActive = true;
const COOLDOWN_MINUTES = 10;
const BUG_COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;

// === Fungsi: Popup ===
function openPopup(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "flex";
}

function closePopup(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}

function showSendBugPopup(number, bugType) {
    popupTo.textContent = number;
    popupBugType.textContent = bugType;
    openPopup("popupSendBug");
}

function showPopupError(message) {
    popupErrorText.textContent = message;
    openPopup("popupError");
}

// === Utilitas ===
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateHistoryUI() {
    historyList.innerHTML = "";
    history.slice(-5).reverse().forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.number} (${item.type})`;
        historyList.appendChild(li);
    });
    historyBox.style.display = history.length ? "block" : "none";
}

function getCooldownRemaining() {
    const lastTime = localStorage.getItem("bugServerBusyUntil");
    if (!lastTime) return 0;
    const remaining = parseInt(lastTime, 10) - Date.now();
    return remaining > 0 ? remaining : 0;
}

// === Bot Cooldown ===
// === Cooldown dan Status ===
function deactivateBot() {
    isBotActive = false;
    bugSpamCount = 0;
    botStatus.textContent = "Server Sibuk";
    sendBtn.disabled = true;

    const interval = setInterval(() => {
        const remaining = getCooldownRemaining();
        if (remaining <= 0) {
            clearInterval(interval);
            activateBot();
        } else {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            sendBtn.textContent = `Wait ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        }
    }, 1000);
}

function activateBot() {
    isBotActive = true;
    bugSpamCount = 0;
    sendBtn.disabled = false;
    sendBtn.textContent = "SEND BUG";
    botStatus.textContent = "Server Aktif";
    localStorage.removeItem("bugServerBusyUntil");
}

function getCooldownRemaining() {
    const cooldownUntil = localStorage.getItem("bugServerBusyUntil");
    if (!cooldownUntil) return 0;
    return Math.max(0, cooldownUntil - Date.now());
}

window.addEventListener("load", () => {
    const remaining = getCooldownRemaining();
    if (remaining > 0) {
        deactivateBot();
    } else {
        activateBot();
    }
});

// === Event Listener: Popup Buttons Auto-close ===
document.querySelectorAll(".popup-overlay button").forEach(btn => {
    btn.addEventListener("click", () => {
        const popup = btn.closest(".popup-overlay");
        if (popup && !btn.classList.contains("no-close")) {
            popup.style.display = "none";
        }
    });
});

// === Event: Toggle History ===
historyIcon?.addEventListener("click", () => {
    historyBox.style.display = historyBox.style.display === "block" ? "none" : "block";
    if (historyBox.style.display === "block") updateHistoryUI();
});

// === Event: Clear History ===
clearHistoryBtn?.addEventListener("click", () => {
    openPopup("popupConfirmDelete");
});

confirmYesBtn?.addEventListener("click", () => {
    history = [];
    localStorage.removeItem("bugHistory");
    updateHistoryUI();
    closePopup("popupConfirmDelete");
});

// === Event: Send Bug ===
sendBtn?.addEventListener("click", async () => {
    if (!isBotActive) return;

    const number = inputNumber.value.trim();
    const type = bugTypeSelect.value;

    // Validasi
    if (!number.startsWith("628")) return showPopupError("Nomor harus diawali dengan 628");
    if (number.length > 13) return showPopupError("Maksimal 13 digit angka.");
    if (!/^\d+$/.test(number)) return showPopupError("Nomor hanya boleh mengandung angka.");

    // Loading animasi
    waitText.textContent = "wait.";
    await delay(500);
    waitText.textContent = "wait..";
    await delay(500);
    waitText.textContent = "wait...";
    await delay(500);
    waitText.textContent = "";

    // Tampilkan popup berhasil
    showSendBugPopup(number, type);

    // Simpan history
    history.push({ number, type });
    localStorage.setItem("bugHistory", JSON.stringify(history));
    updateHistoryUI();

    // Cek spam
    bugSpamCount++;
    if (bugSpamCount >= 3) {
        const busyTime = Date.now() + BUG_COOLDOWN_MS;
        localStorage.setItem("bugServerBusyUntil", busyTime.toString());
        deactivateBot();
    }
});

// === Login System ===
const accounts = [
    { user: "lanzz", pass: "free", used: false }
];

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginError = document.getElementById("loginError");

    const account = accounts.find(acc => acc.user === username && acc.pass === password);

    if (account) {
        if (account.used) {
            loginError.textContent = "Akun sudah digunakan!";
            loginError.style.display = "block";
        } else {
            account.used = true;
            localStorage.setItem("loggedInUser", username);
            loginScreen.style.display = "none";
            attackMenu.style.display = "block";
            loginError.style.display = "none";
        }
    } else {
        loginError.textContent = "Username / Password salah!";
        loginError.style.display = "block";
    }
}

function logout() {
    localStorage.removeItem("loggedInUser");
    location.reload();
}

// === Auto-login saat reload ===
window.onload = function () {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        loginScreen.style.display = "none";
        attackMenu.style.display = "block";
    }
};

// === Event: Info Button ===
infoBtn?.addEventListener("click", () => {
    infoPopup.style.display = infoPopup.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
    if (!infoBtn.contains(e.target) && !infoPopup.contains(e.target)) {
        infoPopup.style.display = "none";
    }
});

const holo = document.querySelector('.sky-holo-main');
const messages = [
  "Website Bugs",
  "SC LanzzV2 ",
  "Free User"
];

function showHologram() {
  const randomText = messages[Math.floor(Math.random() * messages.length)];
  holo.textContent = randomText;

  holo.style.opacity = "1";
  holo.style.transform = "translateX(-50%) translateY(0px)";

  setTimeout(() => {
    holo.style.opacity = "0";
    holo.style.transform = "translateX(-50%) translateY(-20px)";
  }, 5000);
}

showHologram();
setInterval(showHologram, 10000);