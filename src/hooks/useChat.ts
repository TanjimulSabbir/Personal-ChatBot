import { useState, useCallback } from "react";
import { sendChat } from "../api/chat";
import type { Message } from "../types/types";

export function useChat(model: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || loading) return;

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
      const history = [...messages, userMsg];
      setMessages(history);
      setLoading(true);

      try {
        // error message গুলো server-এ পাঠানো হবে না
        const payload = history
          .filter((m) => !m.isError)
          .map(({ role, content }) => ({ role, content }));

        const result = await sendChat(payload, model || undefined);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.reply,
            model: result.model,
          },
        ]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: (e as Error).message,
            isError: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, model]
  );

  const clear = useCallback(() => setMessages([]), []);

  return { messages, loading, send, clear };
}