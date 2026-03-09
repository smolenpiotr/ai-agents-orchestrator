export type OpenclawAgent = {
  id: string;
  name: string;
  description?: string;
};

export type OpenclawChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};
