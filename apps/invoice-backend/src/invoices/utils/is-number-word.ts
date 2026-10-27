// "1,234.50", "$99", "EUR12" or "-5", but not "INV-2024" or "Invoice"
export const isNumberWord = (text: string): boolean =>
  /\d/.test(text) && !/\p{L}{4,}/u.test(text) && !/\d\p{L}/u.test(text.replace(/^\p{L}{1,3}/u, ""));
