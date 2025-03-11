// Add type declaration for drizzle-kit
declare module "drizzle-kit" {
  export interface Config {
    schema: string;
    out: string;
    driver: string;
    dbCredentials: {
      url: string;
    };
    verbose?: boolean;
    strict?: boolean;
  }
}

import type { Config } from 'drizzle-kit';
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      join(process.cwd(), "data", "database.sqlite"),
  },
  verbose: true,
  strict: true,
} satisfies Config;
