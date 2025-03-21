// Basic Node.js module declarations to fix TypeScript errors

declare module 'fs' {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean; mode?: number }): void;
  export function mkdir(path: string, options: { recursive?: boolean; mode?: number }, callback: (err: any) => void): void;
}

declare module 'path' {
  export function join(...paths: string[]): string;
  export function dirname(path: string): string;
  export function resolve(...paths: string[]): string;
}

// Add Node.js global declarations if needed
declare namespace NodeJS {
  interface Process {
    env: {
      [key: string]: string | undefined;
      NODE_ENV?: string;
      DATABASE_URL?: string;
    };
    exit(code?: number): never;
    cwd(): string;
  }
}

declare var process: NodeJS.Process;
declare var require: NodeRequire;
declare var module: NodeModule;

interface NodeRequire {
  main?: NodeModule;
}

interface NodeModule {
  id: string;
  path: string;
  exports: any;
  parent: NodeModule | null;
} 