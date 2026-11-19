import type { ModelInfo } from "../types/types";
import { API_BASE_URL } from "./baseUrl";

function isModelInfo(value: unknown): value is ModelInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "owner" in value &&
    typeof value.owner === "string"
  );
}

export async function fetchModels(): Promise<{ models: ModelInfo[]; default: string }> {
  const res = await fetch(`${API_BASE_URL}/api/models`);
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : `সার্ভারে সমস্যা (${res.status})`;
    throw new Error(message);
  }

  if (typeof data !== "object" || data === null || !("models" in data) || !Array.isArray(data.models)) {
    throw new Error("সার্ভার থেকে মডেলের তালিকা সঠিকভাবে পাওয়া যায়নি");
  }

  const models = data.models.filter(isModelInfo);
  if (models.length !== data.models.length) {
    throw new Error("সার্ভারের মডেল তালিকায় ভুল তথ্য রয়েছে");
  }

  return {
    models,
    default: "default" in data && typeof data.default === "string" ? data.default : "",
  };
}
