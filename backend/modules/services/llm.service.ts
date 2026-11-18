import OpenAI from "openai";
import { config } from "../../config";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ModelInfo = { id: string; name: string; owner: string };

const client = new OpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseURL,
});

const SYSTEM_PROMPT = "তুমি একজন বন্ধুত্বপূর্ণ সহায়ক। বাংলায় উত্তর দাও।";

// chat-এর অযোগ্য model (অডিও, নিরাপত্তা যাচাই ইত্যাদি) বাদ
const NON_CHAT = ["whisper", "orpheus", "guard", "safeguard", "tts", "embed", "moderation"];

// "openai/gpt-oss-120b" → "GPT OSS 120B"
function prettify(id: string): string {
  const base = id.split("/").pop() ?? id;
  return base
    .split("-")
    .map((p) =>
      /^(gpt|oss|ai)$/i.test(p) || /^\d+(\.\d+)?b$/i.test(p)
        ? p.toUpperCase()
        : p.charAt(0).toUpperCase() + p.slice(1)
    )
    .join(" ");
}

// প্রতিবার Groq-কে না ডেকে ৫ মিনিট মনে রাখি
let cache: { at: number; models: ModelInfo[] } | null = null;

export async function listModels(): Promise<ModelInfo[]> {
  if (cache && Date.now() - cache.at < 5 * 60_000) return cache.models;

  const res = await client.models.list();
  const models = res.data
    .filter((m) => !NON_CHAT.some((w) => m.id.toLowerCase().includes(w)))
    .map((m) => ({ id: m.id, name: prettify(m.id), owner: m.owned_by ?? "" }))
    .sort((a, b) => a.name.localeCompare(b.name));

  cache = { at: Date.now(), models };
  return models;
}

export async function chat(
  messages: ChatMessage[],
  model?: string
): Promise<{ reply: string; model: string }> {
  const chosen = model || config.model;

  const result = await client.chat.completions.create({
    model: chosen,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-20), // শুধু শেষ ২০টা message
    ],
  });

  return { reply: result.choices[0].message.content ?? "", model: chosen };
}