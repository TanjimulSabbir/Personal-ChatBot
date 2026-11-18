import type { Role } from "../types/types";

type ApiMessage = { role: Role; content: string };

export async function sendChat(
  messages: ApiMessage[],
  model?: string
): Promise<{ reply: string; model: string }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error ?? `সার্ভারে সমস্যা (${res.status})`);
  }
  return data;
}