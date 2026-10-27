// A repeated element as an array, also when it appears once or not at all
export const xmlList = (node: unknown): unknown[] => {
  if (node === undefined || node === null) return [];
  return Array.isArray(node) ? node : [node];
};
