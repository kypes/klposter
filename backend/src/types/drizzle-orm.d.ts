declare module 'drizzle-orm/better-sqlite3' {
  import { Database } from 'better-sqlite3';
  
  export interface DrizzleConfig {
    schema?: any;
    logger?: any;
  }
  
  export function drizzle(db: Database, config?: DrizzleConfig): any;
  
  export interface Migrator {
    migrationsFolder: string;
    migrationsTable?: string;
  }
  
  export interface Migrate {
    (db: any, config: Migrator): Promise<void>;
  }
}

declare module 'drizzle-orm/better-sqlite3/migrator' {
  export const migrate: any;
} 