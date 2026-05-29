const statusEl = document.getElementById("status");
const accountSelectorEl = document.getElementById("accountSelector");
const accountsListEl = document.getElementById("accountsList");
const accountTemplate = document.getElementById("accountTemplate");
const errorMessageEl = document.getElementById("errorMessage");
const refreshButton = document.getElementById("refreshButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");

document.addEventListener("DOMContentLoaded", async () => {
  await sendMessage({ type: "POPUP_OPENED" });
  await refreshState();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.action === "accountsUpdated") {
    refreshState();
  }
});

refreshButton.addEventListener("click", async () => {
  setBusy(true);
  const response = await sendMessage({ action: "refresh", manual: true });
  setBusy(false);
  showError(response?.error);
  await refreshState();
});

clearHistoryButton.addEventListener("click", async () => {
  setBusy(true);
  const response = await sendMessage({ action: "clearHistory" });
  setBusy(false);
  showError(response?.error);
  await refreshState();
});

accountSelectorEl.addEventListener("change", async () => {
  if (!accountSelectorEl.value) {
    return;
  }

  setBusy(true);
  const response = await sendMessage({ action: "switchAccount", email: accountSelectorEl.value });
  setBusy(false);
  showError(response?.error);
  await refreshState();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && (changes.accounts || changes.activeAccount || changes.activeEmail || changes.lastError)) {
    refreshState();
  }
});

async function refreshState() {
  const state = await sendMessage({ action: "getAccounts" });
  const accounts = state?.accounts || [];
  const activeEmail = state?.activeAccount || state?.activeEmail || null;

  statusEl.textContent = accounts.length
    ? `${accounts.length} account${accounts.length > 1 ? "s" : ""} connected${activeEmail ? ` - Active: ${activeEmail}` : ""}`
    : "No account connected";

  refreshButton.hidden = accounts.length === 0;
  clearHistoryButton.hidden = accounts.length === 0;

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
    const otp = getDisplayableOtp(account);
    node.classList.toggle("account-card--active", isActive);
    node.querySelector(".account-card__active").hidden = !isActive;
    node.querySelector(".account-card__code strong").textContent = otp || "None";
    node.querySelector(".account-card__meta").textContent = otp || "No valid OTP detected yet";

    node.querySelector(".account-card__logout").addEventListener("click", async () => {
      setBusy(true);
      const response = await sendMessage({ action: "disconnect", email: account.email });
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

  for (const button of [refreshButton, clearHistoryButton, ...accountsListEl.querySelectorAll("button")]) {
    button.disabled = isBusy;
  }
}

function showError(message) {
  errorMessageEl.hidden = !message;
  errorMessageEl.textContent = message || "";
}

function getDisplayableOtp(account) {
  for (const value of [account.lastOTP, account.latestOtp, account.lastCode]) {
    const candidate = normalizeOtp(value);

    if (candidate) {
      return candidate;
    }
  }

  return null;
}

function normalizeOtp(value) {
  const candidate = String(value || "")
    .trim()
    .replace(/^[^A-Z0-9]+|[^A-Z0-9]+$/gi, "")
    .toUpperCase();
  const compact = candidate.replace(/-/g, "");

  if (!candidate || candidate.length < 4 || candidate.length > 10) {
    return null;
  }

  if (!/^(?:\d{4,8}|[A-Z0-9]{4,10}|[A-Z0-9]{2,6}-[A-Z0-9]{2,6})$/.test(candidate)) {
    return null;
  }

  return /\d/.test(compact) ? candidate : null;
}
