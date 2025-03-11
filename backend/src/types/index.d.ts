// Type declarations for modules without TypeScript definitions

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

declare module "dotenv" {
  export function config(options?: { path?: string; encoding?: string; debug?: boolean; override?: boolean }): void;
  export const parse: any;
  export const DotenvConfigOutput: any;
} 