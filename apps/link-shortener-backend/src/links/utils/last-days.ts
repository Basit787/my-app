// The last `count` UTC days as YYYY-MM-DD, oldest first, plus the first day's midnight
export const lastDays = (count: number): { from: Date; days: string[] } => {
  const from = new Date();
  from.setUTCHours(0, 0, 0, 0);
  from.setUTCDate(from.getUTCDate() - (count - 1));
  const days = Array.from({ length: count }, (_, index) => {
    const day = new Date(from);
    day.setUTCDate(from.getUTCDate() + index);
    return day.toISOString().slice(0, 10);
  });
  return { from, days };
};
