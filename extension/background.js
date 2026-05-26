const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const AUTO_SCAN_MINUTES = 2;
const FIRST_SCAN_MINUTES = 30;
const MANUAL_SCAN_MINUTES = 30;
const AUTO_MAX_RESULTS = 5;
const MANUAL_MAX_RESULTS = 10;
const POLL_INTERVAL_MS = 3 * 1000;
const MAX_ACCOUNTS = 4;
const MAX_IGNORED_MESSAGES = 100;
const EXTENSION_NAME = "GMAIL OTP BANNER";

let pollTimerId = null;
let isScanning = false;
let currentBannerItem = null;
let lastNotificationKey = null;
let lastNotificationAt = 0;

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get(["accounts", "lastError"]);
  await chrome.storage.local.set({
    accounts: normalizeAccounts(stored.accounts),
    lastError: stored.lastError || null
  });
  startPolling();
});

chrome.runtime.onStartup.addListener(() => {
  startPolling();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "gmail-otp-poll") {
    scanAllAccounts({ minutes: AUTO_SCAN_MINUTES, maxResults: AUTO_MAX_RESULTS, source: "auto" });
  }
});

chrome.tabs.onActivated.addListener(() => {
  scanAllAccounts({ minutes: AUTO_SCAN_MINUTES, maxResults: AUTO_MAX_RESULTS, source: "auto" });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "LOGIN_GMAIL") {
    connectAccount().then(sendResponse);
    return true;
  }

  if (message?.type === "LOGOUT_GMAIL") {
    disconnectAccount(message.email).then(sendResponse);
    return true;
  }

  if (message?.type === "CHECK_NOW") {
    scanAllAccounts({
      minutes: message.manual ? MANUAL_SCAN_MINUTES : AUTO_SCAN_MINUTES,
      maxResults: message.manual ? MANUAL_MAX_RESULTS : AUTO_MAX_RESULTS,
      source: message.manual ? "manual" : "auto"
    }).then(sendResponse);
    return true;
  }

  if (message?.type === "POPUP_OPENED") {
    scanAllAccounts({ minutes: AUTO_SCAN_MINUTES, maxResults: AUTO_MAX_RESULTS, source: "auto" }).then(sendResponse);
    return true;
  }

  if (message?.type === "GET_STATE") {
    getState().then(sendResponse);
    return true;
  }

  if (message?.type === "CLEAR_HISTORY") {
    clearHistory().then(sendResponse);
    return true;
  }

  if (message?.type === "OTP_BANNER_CLOSED") {
    handleBannerClosed(message.item, message.reason).then(sendResponse);
    return true;
  }

  return false;
});

startPolling();

async function connectAccount() {
  try {
    const accounts = await loadAccounts();

    if (accounts.length >= MAX_ACCOUNTS) {
      return setError("Maximum 4 accounts allowed.");
    }

    let { email, token } = await getTokenAndEmailWithRetry();
    let existingIndex = accounts.findIndex((account) => account.email === email);

    if (existingIndex >= 0 && accounts.length < MAX_ACCOUNTS) {
      await removeCachedToken(token);
      const retry = await getTokenAndEmailWithRetry();
      email = retry.email;
      token = retry.token;
      existingIndex = accounts.findIndex((account) => account.email === email);
    }

    const connectedAt = Date.now();
    const baseline = await initializeAccountBaseline(email, token, connectedAt);

    if (existingIndex >= 0) {
      accounts[existingIndex] = {
        ...accounts[existingIndex],
        token,
        connectedAt,
        baselineInternalDate: baseline.baselineInternalDate,
        processedMessageIds: baseline.processedMessageIds,
        latestOtp: null,
        latestMessageId: null,
        lastCode: null,
        lastMessageId: null,
        lastDetectedAt: null
      };
    } else {
      accounts.push(createAccount(email, token, connectedAt, baseline));
    }

    await saveAccounts(accounts);
    await chrome.storage.local.set({ lastError: null });
    console.log("[Auth] account connected", { email });
    return { ok: true, email };
  } catch (error) {
    return setError(normalizeError(error));
  }
}

async function disconnectAccount(email) {
  const accounts = await loadAccounts();
  const account = accounts.find((item) => item.email === email);

  if (account?.token) {
    await removeCachedToken(account.token);
  }

  if (currentBannerItem?.email === email) {
    currentBannerItem = null;
    await clearActiveBanner();
  }

  await saveAccounts(accounts.filter((account) => account.email !== email));
  await chrome.storage.local.set({ lastError: null });
  return { ok: true };
}

async function clearHistory() {
  const accounts = await loadAccounts();
  const cleared = accounts.map((account) => ({
    ...account,
    lastCode: null,
    latestOtp: null,
    lastMessageId: null,
    latestMessageId: null,
    lastProcessedMessageId: null,
    lastDetectedAt: null,
    processedMessageIds: [],
    ignoredMessageIds: []
  }));

  currentBannerItem = null;
  await clearActiveBanner();
  await saveAccounts(cleared);
  await chrome.storage.local.set({ lastError: null });
  return { ok: true };
}

async function getState() {
  const stored = await chrome.storage.local.get(["accounts", "lastError"]);
  const accounts = normalizeAccounts(stored.accounts).map((account) => ({
    email: account.email,
    connectedAt: account.connectedAt,
    lastCode: account.lastCode || null,
    latestOtp: account.latestOtp || account.lastCode || null,
    lastMessageId: account.lastMessageId || null,
    latestMessageId: account.latestMessageId || account.lastMessageId || null,
    lastDetectedAt: account.lastDetectedAt || null,
    ignoredCount: account.ignoredMessageIds.length
  }));

  return {
    ok: true,
    accounts,
    isConnected: accounts.length > 0,
    currentBanner: currentBannerItem,
    lastError: stored.lastError || null
  };
}

function startPolling() {
  if (!pollTimerId) {
    pollTimerId = setInterval(() => {
      scanAllAccounts({ minutes: AUTO_SCAN_MINUTES, maxResults: AUTO_MAX_RESULTS, source: "auto" });
    }, POLL_INTERVAL_MS);
  }

  chrome.alarms.create("gmail-otp-poll", {
    delayInMinutes: 0.5,
    periodInMinutes: 0.5
  });

  scanAllAccounts({ minutes: AUTO_SCAN_MINUTES, maxResults: AUTO_MAX_RESULTS, source: "auto" });
}

async function scanAllAccounts({ minutes, maxResults, source }) {
  if (isScanning) {
    console.log("[OTP] duplicate skipped", { reason: "scan already running", source });
    return { ok: true, skipped: true };
  }

  isScanning = true;

  try {
    logScanStarted(source);
    const accounts = await loadAccounts();

    for (const account of accounts) {
      const updatedAccount = await scanAccount(account, { minutes, maxResults, source });

      if (updatedAccount) {
        await updateAccount(updatedAccount);
      }
    }

    return { ok: true };
  } catch (error) {
    return setError(normalizeError(error));
  } finally {
    isScanning = false;
  }
}

async function scanAccount(account, { minutes, maxResults, source }) {
  console.log("[OTP] scanning account", { email: account.email, minutes, maxResults, source });

  const token = account.token;

  if (!token) {
    console.log("[OTP] no OTP found", { email: account.email, reason: "missing token" });
    return account;
  }

  try {
    const messages = await listRecentMessages(token, minutes, maxResults);
    console.log("[OTP] messages found", { email: account.email, count: messages.length });
    const messageMetadata = await Promise.all(messages.map((message) => getMessageMetadata(token, message.id)));
    const sortedMessages = sortMessagesByNewest(messageMetadata);

    if (!sortedMessages.length) {
      console.log("[OTP] no OTP found", { email: account.email, reason: "no matching messages" });
      return account;
    }

    let nextAccount = account;

    for (const message of sortedMessages) {
      console.log("[OTP] newest message checked", { email: account.email, messageId: message.id });

      if (account.ignoredMessageIds.includes(message.id)) {
        console.log("[OTP] duplicate skipped", { email: account.email, messageId: message.id, reason: "ignored" });
        continue;
      }

      if (!isPostConnectionMessage(message, account)) {
        console.log("[OTP] skipped pre-connection message", {
          email: account.email,
          messageId: message.id,
          internalDate: message.internalDate,
          connectedAt: account.connectedAt,
          baselineInternalDate: account.baselineInternalDate
        });
        continue;
      }

      if (account.processedMessageIds.includes(message.id)) {
        console.log("[OTP] duplicate skipped", { email: account.email, messageId: message.id, reason: "processed" });
        continue;
      }

      const detail = await getMessageDetail(token, message.id);
      const emailParts = messageToEmailParts(detail, account.email);
      const result = extractOtpFromEmail(emailParts);

      nextAccount = {
        ...nextAccount,
        lastProcessedMessageId: message.id,
        processedMessageIds: pushLimited(nextAccount.processedMessageIds, message.id)
      };

      if (!result) {
        continue;
      }

      const detectedAt = new Date().toISOString();
      const bannerItem = {
        email: account.email,
        code: result.code,
        messageId: message.id,
        detectedAt
      };

      console.log("[OTP] candidate accepted", {
        email: account.email,
        messageId: message.id,
        code: result.code,
        confidence: result.confidence,
        reason: result.reason
      });
      console.log("[OTP] valid OTP found", bannerItem);
      console.log("[OTP] new post-connection OTP detected", bannerItem);

      await showOtpBanner(bannerItem);
      notifyCodeDetected(bannerItem);

      return {
        ...nextAccount,
        lastCode: result.code,
        latestOtp: result.code,
        lastMessageId: message.id,
        latestMessageId: message.id,
        lastDetectedAt: detectedAt
      };
    }

    console.log("[OTP] no OTP found", { email: account.email });
    return nextAccount;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      const refreshedToken = await refreshAccountToken(account.token, account.email);

      if (refreshedToken) {
        return {
          ...account,
          token: refreshedToken
        };
      }

      console.log("[OTP] no OTP found", { email: account.email, reason: "token failed" });
      return {
        ...account,
        token: null
      };
    }

    throw error;
  }
}

function extractOtpFromEmail({ subject, body, sender, recipient }) {
  const sourceText = `${subject || ""}\n${body || ""}`.replace(/\s+/g, " ");
  const rejectTerms = buildRejectTerms({ subject, sender, recipient });
  const candidates = [];
  const keywordRegex = /\b(verification code|security code|authentication code|confirmation code|passcode|otp|code)\b/gi;
  let keywordMatch;

  while ((keywordMatch = keywordRegex.exec(sourceText)) !== null) {
    const keyword = keywordMatch[1].toLowerCase();
    const afterStart = keywordMatch.index + keywordMatch[0].length;
    const after = sourceText.slice(afterStart, afterStart + 60);
    const candidateRegex = /\b(?:\d{4,8}|[A-Z0-9]{2,6}-[A-Z0-9]{2,6}|[A-Z0-9]{4,10})\b/gi;
    let candidateMatch;

    while ((candidateMatch = candidateRegex.exec(after)) !== null) {
      const rawCandidate = normalizeCandidate(candidateMatch[0]);
      const distance = candidateMatch.index;
      const phrase = sourceText.slice(keywordMatch.index, afterStart + candidateMatch.index + candidateMatch[0].length);
      const rejection = getCandidateRejectionReason(rawCandidate, phrase, rejectTerms, keyword);

      if (rejection) {
        console.log("[OTP] candidate rejected", { candidate: rawCandidate, reason: rejection });
        continue;
      }

      candidates.push({
        code: rawCandidate,
        keyword,
        distance,
        confidence: scoreCandidate(rawCandidate, keyword, distance, phrase),
        reason: `matched near "${keyword}"`
      });
    }
  }

  if (!candidates.length) {
    return null;
  }

  candidates.sort((a, b) => {
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }

    return a.distance - b.distance;
  });

  const best = candidates[0];
  return {
    code: best.code,
    confidence: best.confidence,
    reason: best.reason
  };
}

function getCandidateRejectionReason(candidate, phrase, rejectTerms, keyword) {
  const compact = candidate.replace(/-/g, "");

  if (!candidate || candidate.length < 4 || candidate.length > 10) {
    return "invalid length";
  }

  if (!/^(?:\d{4,8}|[A-Z0-9]{4,10}|[A-Z0-9]{2,6}-[A-Z0-9]{2,6})$/.test(candidate)) {
    return "invalid format";
  }

  if (/^\d{4}$/.test(candidate) && Number(candidate) >= 1900 && Number(candidate) <= 2099) {
    return "year";
  }

  if (/\b\d{1,2}:\d{2}\b/.test(phrase)) {
    return "time";
  }

  if (/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(phrase)) {
    return "date";
  }

  if (rejectTerms.has(candidate) || rejectTerms.has(compact)) {
    return "generic or message word";
  }

  if (/^[A-Z]+$/.test(candidate) && !isExplicitLettersOnlyPhrase(keyword, phrase)) {
    return "letters-only without explicit phrase";
  }

  if (/^[A-Z]+$/.test(candidate) && candidate.length < 6) {
    return "short letters-only word";
  }

  return null;
}

function isExplicitLettersOnlyPhrase(keyword, phrase) {
  const normalized = phrase.toLowerCase();
  return (
    keyword === "otp" ||
    /\b(your|use|enter)\b.{0,20}\b(verification code|security code|authentication code|confirmation code|passcode|otp|code)\b/.test(normalized) ||
    /\b(verification code|security code|authentication code|confirmation code|passcode|otp)\b.{0,20}(?:is|:|=)/.test(normalized)
  );
}

function scoreCandidate(candidate, keyword, distance, phrase) {
  let score = 50;

  if (/^\d{4,8}$/.test(candidate)) {
    score += 35;
  } else if (/[A-Z]/.test(candidate) && /\d/.test(candidate)) {
    score += 30;
  } else if (candidate.includes("-")) {
    score += 25;
  } else {
    score += 5;
  }

  if (keyword === "code" || keyword === "otp") {
    score += 12;
  }

  if (/\b(is|:|=)\s*$/i.test(phrase.replace(candidate, ""))) {
    score += 8;
  }

  score += Math.max(0, 20 - distance);
  return score;
}

function buildRejectTerms({ subject, sender, recipient }) {
  const terms = new Set([
    "BANNER",
    "EXPIRE",
    "EXPIRES",
    "GMAIL",
    "GOOGLE",
    "LOGIN",
    "ACCOUNT",
    "SECURITY",
    "VERIFY",
    "VERIFICATION",
    "CODE",
    "EMAIL",
    "USER",
    "HELLO",
    "THANK",
    "MINUTES",
    "GMAILOTPBANNER"
  ]);

  for (const value of [subject, sender, recipient, EXTENSION_NAME]) {
    for (const word of String(value || "").toUpperCase().match(/[A-Z]{4,}/g) || []) {
      terms.add(word);
    }
  }

  return terms;
}

function messageToEmailParts(message, accountEmail) {
  const headers = message?.payload?.headers || [];
  const subject = getHeader(headers, "Subject");
  const sender = getHeader(headers, "From");
  const recipient = getHeader(headers, "To") || accountEmail;

  return {
    subject,
    sender,
    recipient,
    body: collectMessageBody(message)
  };
}

function collectMessageBody(message) {
  const fragments = [message?.snippet || ""];
  collectPayloadText(message?.payload, fragments);
  return fragments.join("\n").replace(/\s+/g, " ").trim();
}

function collectPayloadText(payload, fragments) {
  if (!payload) {
    return;
  }

  if (payload.body?.data && isReadableMimeType(payload.mimeType)) {
    fragments.push(decodeBase64Url(payload.body.data));
  }

  for (const part of payload.parts || []) {
    collectPayloadText(part, fragments);
  }
}

function isReadableMimeType(mimeType = "") {
  return mimeType === "text/plain" || mimeType === "text/html";
}

function getHeader(headers, name) {
  return headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value || "";
}

async function listRecentMessages(token, minutes, maxResults) {
  const url = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  const query = buildGmailQuery(minutes);
  console.log("[OTP] Gmail query used", { query, maxResults });
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("fields", "messages(id),resultSizeEstimate");

  const response = await fetchWithAuth(url.toString(), token);

  if (!response.ok) {
    throw createHttpError("Gmail list failed", response);
  }

  const data = await response.json();
  return data.messages || [];
}

async function getMessageDetail(token, messageId) {
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`);
  url.searchParams.set("format", "full");
  url.searchParams.set(
    "fields",
    "id,internalDate,snippet,payload(headers(name,value),mimeType,body(data),parts(mimeType,body(data),parts(mimeType,body(data))))"
  );

  const response = await fetchWithAuth(url.toString(), token);

  if (!response.ok) {
    throw createHttpError("Gmail get failed", response);
  }

  return response.json();
}

async function getMessageMetadata(token, messageId) {
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`);
  url.searchParams.set("format", "metadata");
  url.searchParams.set("metadataHeaders", "Subject");
  url.searchParams.set("fields", "id,internalDate,payload(headers(name,value))");

  const response = await fetchWithAuth(url.toString(), token);

  if (!response.ok) {
    throw createHttpError("Gmail metadata get failed", response);
  }

  return response.json();
}

function buildGmailQuery(minutes) {
  return `newer_than:${minutes}m (verification OR verify OR OTP OR code OR security OR authentication OR confirmation OR passcode)`;
}

function logScanStarted(source) {
  if (source === "first") {
    console.log("[OTP] first scan started");
    return;
  }

  if (source === "manual") {
    console.log("[OTP] manual refresh started");
    return;
  }

  console.log("[OTP] auto polling started");
}

function sortMessagesByNewest(messages) {
  return [...messages].sort((a, b) => Number(b.internalDate || 0) - Number(a.internalDate || 0));
}

async function initializeAccountBaseline(email, token, connectedAt) {
  const messages = await listRecentMessages(token, FIRST_SCAN_MINUTES, MANUAL_MAX_RESULTS);
  const messageMetadata = await Promise.all(messages.map((message) => getMessageMetadata(token, message.id)));
  const sortedMessages = sortMessagesByNewest(messageMetadata);
  const baselineInternalDate = sortedMessages[0]?.internalDate || String(connectedAt);
  const processedMessageIds = sortedMessages.map((message) => message.id);

  console.log("[OTP] account baseline initialized", {
    email,
    connectedAt,
    baselineInternalDate,
    processedCount: processedMessageIds.length
  });

  return {
    baselineInternalDate,
    processedMessageIds
  };
}

function isPostConnectionMessage(message, account) {
  const internalDate = Number(message.internalDate || 0);
  const connectedAt = Number(account.connectedAt || 0);
  const baselineInternalDate = Number(account.baselineInternalDate || connectedAt || 0);

  return internalDate > connectedAt && internalDate > baselineInternalDate;
}

async function showOtpBanner(item) {
  currentBannerItem = item;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    await chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_OTP_BANNER",
      item
    });
  } catch (error) {
    await chrome.storage.local.set({ lastError: normalizeError(error) });
  }
}

async function clearActiveBanner() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: "CLEAR_OTP_BANNER" });
  } catch (_error) {
    // The active page may not have content.js injected.
  }
}

async function handleBannerClosed(item, reason) {
  console.log("[OTP] banner closed", { reason, email: item?.email, messageId: item?.messageId });

  if (currentBannerItem?.messageId === item?.messageId && currentBannerItem?.email === item?.email) {
    currentBannerItem = null;
  }

  if (reason === "dismiss" && item?.email && item?.messageId) {
    const accounts = await loadAccounts();
    const account = accounts.find((entry) => entry.email === item.email);

    if (account) {
      account.ignoredMessageIds = pushLimited(account.ignoredMessageIds, item.messageId);
      account.processedMessageIds = pushLimited(account.processedMessageIds, item.messageId);
      account.lastProcessedMessageId = item.messageId;
      await updateAccount(account);
    }
  }

  return { ok: true };
}

function notifyCodeDetected(item) {
  safeNotify({
    key: `${item.email}:${item.messageId}:${item.code}`,
    title: "New OTP Code",
    message: `Verification code ${item.code} detected from ${item.email}`
  });
}

function safeNotify({ key, title, message }) {
  if (!title || !message) {
    console.warn("[OTP] notification skipped: missing fields");
    return;
  }

  const now = Date.now();

  if (key && key === lastNotificationKey && now - lastNotificationAt < 30000) {
    console.log("[OTP] duplicate skipped", { reason: "duplicate notification", key });
    return;
  }

  lastNotificationKey = key || null;
  lastNotificationAt = now;

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title,
    message
  }, () => {
    if (chrome.runtime.lastError) {
      console.warn("[OTP] notification skipped:", chrome.runtime.lastError.message);
    }
  });
}

function getAuthToken({ interactive }) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(token || null);
    });
  });
}

async function getTokenAndEmailWithRetry() {
  const token = await getAuthToken({ interactive: true });

  try {
    return {
      token,
      email: await getAccountEmail(token)
    };
  } catch (error) {
    await removeCachedToken(token);
    const retryToken = await getAuthToken({ interactive: true });

    return {
      token: retryToken,
      email: await getAccountEmail(retryToken)
    };
  }
}

async function refreshAccountToken(token, expectedEmail) {
  if (token) {
    await removeCachedToken(token);
  }

  try {
    const refreshedToken = await getAuthToken({ interactive: false });
    const email = await getAccountEmail(refreshedToken);

    if (email !== expectedEmail) {
      await removeCachedToken(refreshedToken);
      return null;
    }

    return refreshedToken;
  } catch (_error) {
    return null;
  }
}

async function getAccountEmail(token) {
  const userInfoResponse = await fetchWithAuth("https://www.googleapis.com/oauth2/v2/userinfo", token);

  if (userInfoResponse.ok) {
    const userInfo = await userInfoResponse.json();

    if (userInfo.email) {
      return userInfo.email;
    }
  }

  const profileResponse = await fetchWithAuth("https://gmail.googleapis.com/gmail/v1/users/me/profile", token);

  if (!profileResponse.ok) {
    throw createHttpError("Could not read account email", profileResponse);
  }

  const profile = await profileResponse.json();
  return profile.emailAddress;
}

function fetchWithAuth(url, token) {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

async function removeCachedToken(token) {
  if (!token) {
    return;
  }

  try {
    await chrome.identity.removeCachedAuthToken({ token });
  } catch (_error) {
    // Token may already be absent from Chrome's cache.
  }
}

function createHttpError(message, response) {
  const error = new Error(`${message} (${response.status}).`);
  error.status = response.status;
  return error;
}

function isUnauthorizedError(error) {
  return error?.status === 401;
}

async function loadAccounts() {
  const stored = await chrome.storage.local.get(["accounts"]);
  return normalizeAccounts(stored.accounts);
}

async function saveAccounts(accounts) {
  await chrome.storage.local.set({ accounts: normalizeAccounts(accounts) });
}

async function updateAccount(updatedAccount) {
  const accounts = await loadAccounts();
  await saveAccounts(accounts.map((account) => account.email === updatedAccount.email ? normalizeAccount(updatedAccount) : account));
}

function createAccount(email, token, connectedAt, baseline) {
  return normalizeAccount({
    email,
    token,
    connectedAt,
    baselineInternalDate: baseline.baselineInternalDate,
    lastCode: null,
    latestOtp: null,
    lastMessageId: null,
    latestMessageId: null,
    lastProcessedMessageId: null,
    lastDetectedAt: null,
    processedMessageIds: baseline.processedMessageIds,
    ignoredMessageIds: []
  });
}

function normalizeAccounts(accounts) {
  return Array.isArray(accounts) ? accounts.slice(0, MAX_ACCOUNTS).map(normalizeAccount) : [];
}

function normalizeAccount(account) {
  return {
    email: account.email,
    token: account.token || null,
    connectedAt: normalizeTimestamp(account.connectedAt),
    baselineInternalDate: account.baselineInternalDate || normalizeTimestamp(account.connectedAt),
    lastCode: account.lastCode || null,
    latestOtp: account.latestOtp || account.lastCode || null,
    lastMessageId: account.lastMessageId || null,
    latestMessageId: account.latestMessageId || account.lastMessageId || null,
    lastProcessedMessageId: account.lastProcessedMessageId || null,
    lastDetectedAt: account.lastDetectedAt || null,
    processedMessageIds: limitList(account.processedMessageIds),
    ignoredMessageIds: limitList(account.ignoredMessageIds)
  };
}

function pushLimited(list, value) {
  return limitList([value, ...list.filter((item) => item !== value)]);
}

function limitList(list) {
  return Array.isArray(list) ? list.filter(Boolean).slice(0, MAX_IGNORED_MESSAGES) : [];
}

function normalizeTimestamp(value) {
  if (!value) {
    return Date.now();
  }

  const numeric = Number(value);

  if (Number.isFinite(numeric)) {
    return numeric;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function normalizeCandidate(value) {
  return String(value || "")
    .trim()
    .replace(/^[^A-Z0-9]+|[^A-Z0-9]+$/gi, "")
    .toUpperCase();
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = atob(padded);

  try {
    return decodeURIComponent([...decoded].map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""));
  } catch (_error) {
    return decoded;
  }
}

async function setError(message) {
  await chrome.storage.local.set({ lastError: message });
  return { ok: false, error: message };
}

function normalizeError(error) {
  return error?.message || String(error || "Unknown error.");
}
