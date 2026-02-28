// ---- helpers ----
function num(key, fallback = 0) {
  const v = Number(localStorage.getItem(key));
  return Number.isFinite(v) ? v : fallback;
}

function setNum(key, value) {
  localStorage.setItem(key, String(value));
}

// ---- anonymous usage (before login) ----
export function getAnonUsed() {
  return num("anonUsed", 0);
}

export function markAnonUsed() {
  setNum("anonUsed", getAnonUsed() + 1);
}

// ---- logged-in usage (per user UID) ----
export function getLoggedUsed() {
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const uid = profile?.uid;
  if (!uid) return 0;

  return num("loggedUsed_" + uid, 0);
}

export function markLoggedUsed() {
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const uid = profile?.uid;
  if (!uid) return;

  setNum("loggedUsed_" + uid, getLoggedUsed() + 1);
}

// ---- premium flag ----
export function getPremium() {
  return localStorage.getItem("premium") === "1";
}

export function setPremium(val) {
  localStorage.setItem("premium", val ? "1" : "0");
}

// ---- call this ONLY after API success ----
export function markUsageSuccess(isLogged) {
  if (isLogged) markLoggedUsed();
  else markAnonUsed();
}

// ---- reset only anonymous when login ----
export function resetUsage() {
  localStorage.removeItem("anonUsed");
}

// ---- debug helper ----
export function clearPremium() {
  localStorage.removeItem("premium");
}