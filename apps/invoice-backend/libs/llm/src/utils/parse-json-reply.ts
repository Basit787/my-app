// The JSON object in a model reply, also when it is wrapped in prose or a ``` fence
export const parseJsonReply = (reply: string): Record<string, unknown> => {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error(`The model reply has no JSON object: ${reply.slice(0, 200)}`);

  const parsed: unknown = JSON.parse(reply.slice(start, end + 1));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`The model reply is not a JSON object: ${reply.slice(0, 200)}`);
  }
  return parsed as Record<string, unknown>;
};
