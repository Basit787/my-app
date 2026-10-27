// Field validator: empty, or a plain number such as 1234.50
export const validateAmount = ({ value }: { value: string }) =>
  value.trim() === "" || Number.isFinite(Number(value)) ? undefined : "Enter a number, e.g. 1234.50";
