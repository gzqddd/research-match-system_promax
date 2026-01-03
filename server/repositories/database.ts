import { drizzle } from "drizzle-orm/mysql2";
import { Config } from "../core/config";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && Config.database.url) {
    try {
      _db = drizzle(Config.database.url);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

