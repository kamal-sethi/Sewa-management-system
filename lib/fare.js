export function normalizeFareInput(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.toLowerCase() === "n/a" || trimmed.toLowerCase() === "na") {
    return "N/A";
  }

  const numericValue = Number(trimmed);
  if (Number.isFinite(numericValue)) {
    return String(numericValue);
  }

  return trimmed;
}

export function isFareNA(value) {
  const normalized = normalizeFareInput(value).toLowerCase();
  return normalized === "n/a";
}

export function getFareAmount(value) {
  if (isFareNA(value)) {
    return 0;
  }

  const numericValue = Number(normalizeFareInput(value));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function isFareEmpty(value) {
  const normalized = normalizeFareInput(value);
  return !normalized;
}

export function formatFare(value) {
  if (isFareNA(value)) {
    return "N/A";
  }

  const amount = getFareAmount(value);
  return amount > 0 ? `₹${amount}` : "—";
}
