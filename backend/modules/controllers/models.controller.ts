import type { Request, Response } from "express";
import { listModels } from "../services/llm.service";
import { config } from "../../config";

export async function handleModels(_req: Request, res: Response) {
  try {
    const models = await listModels();
    res.json({ models, default: config.model });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "model-এর তালিকা আনা যায়নি" });
  }
}