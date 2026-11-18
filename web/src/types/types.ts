export type Role = "user" | "assistant";

export type Message = {
  id: string;
  role: Role;
  content: string;
  isError?: boolean;
  model?: string; // কোন model উত্তর দিয়েছে
};

export type ModelInfo = { id: string; name: string; owner: string };