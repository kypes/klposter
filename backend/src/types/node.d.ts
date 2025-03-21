// Minimal type declarations for Node.js to fix linter errors
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
    NODE_ENV?: string;
    DATABASE_URL?: string;
  }

  interface Process {
    env: ProcessEnv;
    cwd(): string;
  }
}

declare var process: NodeJS.Process;

declare module 'path' {
  export function join(...paths: string[]): string;
} 