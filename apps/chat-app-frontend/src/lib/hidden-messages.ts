const HIDDEN_MESSAGES_KEY = "hidden_messages";

export const getHiddenMessageIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(HIDDEN_MESSAGES_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
};

export const hideMessageId = (id: string) => {
  const hidden = getHiddenMessageIds();
  hidden.add(id);
  localStorage.setItem(HIDDEN_MESSAGES_KEY, JSON.stringify([...hidden]));
  return hidden;
};

export const unhideMessageId = (id: string) => {
  const hidden = getHiddenMessageIds();
  hidden.delete(id);
  localStorage.setItem(HIDDEN_MESSAGES_KEY, JSON.stringify([...hidden]));
  return hidden;
};
