// Field validator: empty, or a 3-letter ISO code
export const validateCurrency = ({ value }: { value: string }) =>
  value.trim() === "" || /^[A-Za-z]{3}$/.test(value.trim()) ? undefined : "Use a 3-letter code, e.g. USD";
