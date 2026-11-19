import type { ModelInfo } from "../types/types";
import { API_BASE_URL } from "./baseUrl";

export async function fetchModels(): Promise<{ models: ModelInfo[]; default: string }> {
  const res = await fetch(`${API_BASE_URL}/api/models`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `সার্ভারে সমস্যা (${res.status})`);
  return data;
}