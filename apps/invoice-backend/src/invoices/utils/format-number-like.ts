// `value` written the way `original` was: "$1,234.50" + 99 → "$99.00", "1.234,56 €" + 5 → "5,00 €"
export const formatNumberLike = (original: string, value: number): string => {
  const match = /^(\D*?)(-?[\d.,\s]*\d)(\D*)$/.exec(original.trim());
  if (!match) return String(value);
  const [, prefix, printed, suffix] = match;

  const decimalMatch = /([.,])(\d{1,2})$/.exec(printed);
  const decimalSeparator = decimalMatch ? decimalMatch[1] : null;
  const integerPart = decimalMatch ? printed.slice(0, decimalMatch.index) : printed;
  const thousandsSeparator = /[.,\s]/.exec(integerPart.replace(/^-/, ""))?.[0] ?? "";
  // Keep the original's decimals, and more when the new value needs them (a quantity of 2.5)
  const neededDecimals = Math.min((String(value).split(".")[1] ?? "").length, 4);
  const decimals = Math.max(decimalMatch ? decimalMatch[2].length : 0, neededDecimals);

  const [integerDigits, fraction] = Math.abs(value).toFixed(decimals).split(".");
  const grouped = thousandsSeparator
    ? integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
    : integerDigits;
  const separator = decimalSeparator ?? (thousandsSeparator === "." ? "," : ".");
  const sign = value < 0 ? "-" : "";
  return `${prefix}${sign}${grouped}${fraction ? separator + fraction : ""}${suffix}`;
};
