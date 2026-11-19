import type { Message } from "../types/types";

export type StoredSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

const DATABASE_NAME = "aether-ai";
const DATABASE_VERSION = 1;
const STORE_NAME = "app";
const SESSIONS_KEY = "sessions";
const LEGACY_STORAGE_KEY = "noesis-ai-conversations-v1";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open IndexedDB"));
  });
}

function readValue<T>(database: IDBDatabase): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(SESSIONS_KEY);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error ?? new Error("Unable to read chat history"));
  });
}

function writeValue(database: IDBDatabase, sessions: StoredSession[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(sessions, SESSIONS_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Unable to save chat history"));
  });
}

function readLegacySessions(): StoredSession[] {
  try {
    const value = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error("Unable to read legacy chat history from localStorage.", error);
    return [];
  }
}

export async function loadSessions(): Promise<StoredSession[]> {
  try {
    const database = await openDatabase();
    const stored = await readValue<StoredSession[]>(database);
    if (Array.isArray(stored)) return stored;

    const legacy = readLegacySessions();
    if (legacy.length > 0) {
      await writeValue(database, legacy);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    return legacy;
  } catch (error) {
    console.error("IndexedDB is unavailable. Falling back to localStorage.", error);
    return readLegacySessions();
  }
}

export async function saveSessions(sessions: StoredSession[]): Promise<void> {
  try {
    const database = await openDatabase();
    await writeValue(database, sessions);
  } catch (error) {
    console.error("Unable to save chat history in IndexedDB. Falling back to localStorage.", error);
    try {
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(sessions));
    } catch (fallbackError) {
      console.error("Unable to save chat history in localStorage.", fallbackError);
    }
  }
}
