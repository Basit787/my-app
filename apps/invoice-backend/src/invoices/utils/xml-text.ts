// Text of a parsed XML element: the value itself, or "#text" when the element has attributes
export const xmlText = (node: unknown): string | null => {
  if (Array.isArray(node)) return xmlText(node[0]);
  if (typeof node === "string" || typeof node === "number") return String(node).trim() || null;
  if (node && typeof node === "object" && "#text" in node) return xmlText((node as Record<string, unknown>)["#text"]);
  return null;
};
