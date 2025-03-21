// Type declaration for drizzle-kit
declare module 'drizzle-kit' {
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