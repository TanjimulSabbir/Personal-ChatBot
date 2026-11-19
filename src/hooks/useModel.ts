import { useCallback, useEffect, useState } from "react";
import { fetchModels } from "../api/model";
import type { ModelInfo } from "../types/types";

const KEY = "selected-model";

export function useModels() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchModels()
      .then(({ models, default: def }) => {
        if (cancelled) return;
        setModels(models);

        let saved: string | null = null;
        try {
          saved = localStorage.getItem(KEY);
        } catch {
          /* storage বন্ধ থাকলে সমস্যা নেই */
        }

        // আগে সংরক্ষিত পছন্দ, না থাকলে server-এর ডিফল্ট, না থাকলে প্রথমটা
        const pick =
          [saved, def]?.find(
            (id): id is string => !!id && models.some((m) => m.id === id)
          ) ??
          models[0]?.id ??
          "";
        setSelected(pick);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const select = useCallback((id: string) => {
    setSelected(id);
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  return { models, selected, select, error };
}