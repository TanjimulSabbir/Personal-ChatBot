import type { Request, Response } from "express";
import { chat, listModels } from "../services/llm.service";
import type { ChatMessage } from "../services/llm.service";

function isValid(messages: unknown): messages is ChatMessage[] {
  return (
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.every(
      (m) =>
        (m?.role === "user" || m?.role === "assistant") &&
        typeof m?.content === "string"
    )
  );
}

export async function handleChat(req: Request, res: Response) {
  const { messages, model } = req.body ?? {};

  if (!isValid(messages)) {
    return res.status(400).json({ error: "সঠিক messages তালিকা লাগবে" });
  }

  try {
    // ব্রাউজার থেকে আসা model শুধু অনুমোদিত তালিকার হলেই চলবে
    if (model !== undefined) {
      const allowed = await listModels();
      if (typeof model !== "string" || !allowed.some((m) => m.id === model)) {
        return res.status(400).json({ error: "এই model অনুমোদিত নয়" });
      }
    }

    const result = await chat(messages, model);
    res.json(result); // { reply, model }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI থেকে উত্তর আনতে সমস্যা হয়েছে" });
  }
}