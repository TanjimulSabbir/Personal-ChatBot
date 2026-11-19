// app.ts
import express from "express";

// modules/routers/index.ts
import { Router as Router3 } from "express";

// modules/routers/chat.route.ts
import { Router } from "express";

// modules/services/llm.service.ts
import OpenAI from "openai";

// config.ts
import dotenv from "dotenv";
import { fileURLToPath } from "url";
dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });
function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`.env \u09AB\u09BE\u0987\u09B2\u09C7 ${name} \u09A8\u09C7\u0987`);
  return value;
}
var config = {
  port: Number(process.env.PORT ?? 3001),
  apiKey: required("API_KEY"),
  baseURL: required("BASE_URL"),
  model: required("MODEL")
};

// modules/services/llm.service.ts
var client = new OpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseURL
});
var SYSTEM_PROMPT = "\u09A4\u09C1\u09AE\u09BF \u098F\u0995\u099C\u09A8 \u09AC\u09A8\u09CD\u09A7\u09C1\u09A4\u09CD\u09AC\u09AA\u09C2\u09B0\u09CD\u09A3 \u09B8\u09B9\u09BE\u09AF\u09BC\u0995\u0964 \u09AC\u09BE\u0982\u09B2\u09BE\u09AF\u09BC \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BE\u0993\u0964";
var NON_CHAT = ["whisper", "orpheus", "guard", "safeguard", "tts", "embed", "moderation"];
function prettify(id) {
  const base = id.split("/").pop() ?? id;
  return base.split("-").map(
    (p) => /^(gpt|oss|ai)$/i.test(p) || /^\d+(\.\d+)?b$/i.test(p) ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)
  ).join(" ");
}
var cache = null;
async function listModels() {
  if (cache && Date.now() - cache.at < 5 * 6e4) return cache.models;
  const res = await client.models.list();
  const models = res.data.filter((m) => !NON_CHAT.some((w) => m.id.toLowerCase().includes(w))).map((m) => ({ id: m.id, name: prettify(m.id), owner: m.owned_by ?? "" })).sort((a, b) => a.name.localeCompare(b.name));
  cache = { at: Date.now(), models };
  return models;
}
async function chat(messages, model) {
  const chosen = model || config.model;
  const result = await client.chat.completions.create({
    model: chosen,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-20)
      // শুধু শেষ ২০টা message
    ]
  });
  return { reply: result.choices[0].message.content ?? "", model: chosen };
}

// modules/controllers/chat.controller.ts
function isValid(messages) {
  return Array.isArray(messages) && messages.length > 0 && messages.every(
    (m) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string"
  );
}
async function handleChat(req, res) {
  const { messages, model } = req.body ?? {};
  if (!isValid(messages)) {
    return res.status(400).json({ error: "\u09B8\u09A0\u09BF\u0995 messages \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09B2\u09BE\u0997\u09AC\u09C7" });
  }
  try {
    if (model !== void 0) {
      const allowed = await listModels();
      if (typeof model !== "string" || !allowed.some((m) => m.id === model)) {
        return res.status(400).json({ error: "\u098F\u0987 model \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09A8\u09AF\u09BC" });
      }
    }
    const result = await chat(messages, model);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI \u09A5\u09C7\u0995\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u0986\u09A8\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" });
  }
}

// modules/routers/chat.route.ts
var router = Router();
router.post("/", handleChat);
var chat_route_default = router;

// modules/routers/models.route.ts
import { Router as Router2 } from "express";

// modules/controllers/models.controller.ts
async function handleModels(_req, res) {
  try {
    const models = await listModels();
    res.json({ models, default: config.model });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "model-\u098F\u09B0 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u0986\u09A8\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" });
  }
}

// modules/routers/models.route.ts
var router2 = Router2();
router2.get("/", handleModels);
var models_route_default = router2;

// modules/routers/index.ts
var router3 = Router3();
router3.get("/health", (_req, res) => {
  res.json({ ok: true });
});
router3.use("/chat", chat_route_default);
router3.use("/models", models_route_default);
var routers_default = router3;

// app.ts
var app = express();
var allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "").split(",").map((origin) => origin.trim()).filter(Boolean);
app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(origin && !allowedOrigins.includes(origin) ? 403 : 204);
  }
  next();
});
app.use(express.json({ limit: "1mb" }));
app.get("/", (_req, res) => {
  res.json({
    name: "Persona Chat Bot API",
    status: "ok",
    health: "/api/health"
  });
});
app.use("/api", routers_default);
var app_default = app;

// index.ts
var index_default = app_default;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map