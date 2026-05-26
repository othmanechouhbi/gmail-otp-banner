const statusEl = document.getElementById("status");
const accountCountEl = document.getElementById("accountCount");
const accountSelectorEl = document.getElementById("accountSelector");
const accountsListEl = document.getElementById("accountsList");
const accountTemplate = document.getElementById("accountTemplate");
const errorMessageEl = document.getElementById("errorMessage");
const loginButton = document.getElementById("loginButton");
const refreshButton = document.getElementById("refreshButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");

document.addEventListener("DOMContentLoaded", async () => {
  await sendMessage({ type: "POPUP_OPENED" });
  await refreshState();
});

loginButton.addEventListener("click", async () => {
  setBusy(true);
  const response = await sendMessage({ type: "LOGIN_GMAIL" });
  setBusy(false);
  showError(response?.error);
  await refreshState();
});

refreshButton.addEventListener("click", async () => {
  setBusy(true);
  const response = await sendMessage({ type: "CHECK_NOW", manual: true });
  setBusy(false);
  showError(response?.error);
  await refreshState();
});

clearHistoryButton.addEventListener("click", async () => {
  setBusy(true);
  const response = await sendMessage({ type: "CLEAR_HISTORY" });
  setBusy(false);
  showError(response?.error);
  await refreshState();
});

accountSelectorEl.addEventListener("change", async () => {
  if (!accountSelectorEl.value) {
    return;
  }

  setBusy(true);
  const response = await sendMessage({ type: "SWITCH_ACCOUNT", email: accountSelectorEl.value });
  setBusy(false);
  showError(response?.error);
  await refreshState();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && (changes.accounts || changes.activeEmail || changes.lastError)) {
    refreshState();
  }
});

async function refreshState() {
  const state = await sendMessage({ type: "GET_STATE" });
  const accounts = state?.accounts || [];
  const activeEmail = state?.activeEmail || null;

  statusEl.textContent = accounts.length
    ? `${accounts.length} account${accounts.length > 1 ? "s" : ""} connected${activeEmail ? ` - Active: ${activeEmail}` : ""}`
    : "No account connected";

  accountCountEl.textContent = `${accounts.length}/4`;
  accountCountEl.classList.toggle("status--online", accounts.length > 0);
  accountCountEl.classList.toggle("status--offline", accounts.length === 0);
  loginButton.disabled = accounts.length >= 4;

  renderAccountSelector(accounts, activeEmail);
  renderAccounts(accounts, activeEmail);
  showError(state?.lastError);
}

function renderAccountSelector(accounts, activeEmail) {
  accountSelectorEl.textContent = "";
  accountSelectorEl.disabled = accounts.length === 0;

  if (!accounts.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No connected accounts";
    accountSelectorEl.appendChild(option);
    return;
  }

  for (const account of accounts) {
    const option = document.createElement("option");
    option.value = account.email;
    option.textContent = account.email;
    option.selected = account.email === activeEmail;
    accountSelectorEl.appendChild(option);
  }
}

function renderAccounts(accounts, activeEmail) {
  accountsListEl.textContent = "";

  if (!accounts.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Connect a Gmail account to start.";
    accountsListEl.appendChild(empty);
    return;
  }

  for (const account of accounts) {
    const node = accountTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".account-card__email").textContent = account.email;
    const isActive = account.email === activeEmail;
    node.classList.toggle("account-card--active", isActive);
    node.querySelector(".account-card__active").hidden = !isActive;
    node.querySelector(".account-card__code strong").textContent = account.latestOtp || account.lastCode || "None";
    node.querySelector(".account-card__meta").textContent = account.lastDetectedAt
      ? `Detected ${new Date(account.lastDetectedAt).toLocaleString()}`
      : "No valid OTP detected yet";

    const switchButton = node.querySelector(".account-card__switch");
    switchButton.disabled = isActive;
    switchButton.addEventListener("click", async () => {
      setBusy(true);
      const response = await sendMessage({ type: "SWITCH_ACCOUNT", email: account.email });
      setBusy(false);
      showError(response?.error);
      await refreshState();
    });

    node.querySelector(".account-card__logout").addEventListener("click", async () => {
      setBusy(true);
      const response = await sendMessage({ type: "LOGOUT_GMAIL", email: account.email });
      setBusy(false);
      showError(response?.error);
      await refreshState();
    });

    accountsListEl.appendChild(node);
  }
}

function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }

      resolve(response);
    });
  });
}

function setBusy(isBusy) {
  accountSelectorEl.disabled = isBusy || accountSelectorEl.options.length === 0;

  for (const button of [loginButton, refreshButton, clearHistoryButton, ...accountsListEl.querySelectorAll("button")]) {
    button.disabled = isBusy;
  }
}

function showError(message) {
  errorMessageEl.hidden = !message;
  errorMessageEl.textContent = message || "";
}
