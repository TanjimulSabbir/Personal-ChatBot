import type { ModelInfo } from "../types/types";

export async function fetchModels(): Promise<{ models: ModelInfo[]; default: string }> {
  const res = await fetch("/api/models");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `সার্ভারে সমস্যা (${res.status})`);
  return data;
}