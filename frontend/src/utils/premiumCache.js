export function setPremiumCache(val) {
  localStorage.setItem("premium", val ? "1" : "0");
}

export function getPremiumCache() {
  return localStorage.getItem("premium") === "1";
}