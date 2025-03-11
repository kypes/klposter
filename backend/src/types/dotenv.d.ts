// Type declaration for dotenv
declare module 'dotenv' {
  export function config(options?: { path?: string; encoding?: string; debug?: boolean; override?: boolean }): void;
  export const parse: any;
  export const DotenvConfigOutput: any;
} 