import dotenv from "dotenv";
import { fileURLToPath } from "url";

// .env আছে config.ts-এর পাশেই (backend ফোল্ডারে)
dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`.env ফাইলে ${name} নেই`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  apiKey: required("API_KEY"),
  baseURL: required("BASE_URL"),
  model: required("MODEL"),
};