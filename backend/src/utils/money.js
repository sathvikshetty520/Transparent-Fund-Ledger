function normalizeMoney(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const stringValue = String(value).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(stringValue)) {
    throw new Error("Invalid money value");
  }

  const [whole, decimal = ""] = stringValue.split(".");

  return `${whole}.${decimal.padEnd(2, "0")}`;
}

function isPositiveMoney(value) {
  if (typeof value !== "string") {
    value = String(value);
  }

  return /^(0*[1-9]\d*)(\.\d{1,2})?$/.test(value.trim());
}

module.exports = {
  normalizeMoney,
  isPositiveMoney
};