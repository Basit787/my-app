// The node at a path of element names in parsed XML; repeated elements follow their first one
export const xmlAt = (node: unknown, ...names: string[]): unknown => {
  let current = node;
  for (const name of names) {
    if (Array.isArray(current)) current = current[0];
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[name];
  }
  return current;
};
