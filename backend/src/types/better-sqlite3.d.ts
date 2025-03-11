declare module 'better-sqlite3' {
  interface DatabaseOptions {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: Function;
  }

  interface Database {
    prepare(sql: string): Statement;
    transaction(fn: Function): Function;
    pragma(pragma: string, options?: { simple?: boolean }): any;
    backup(destination: string | Database, options?: { attached?: string; progress?: Function }): Promise<void>;
    close(): void;
    exec(sql: string): void;
    loadExtension(path: string): void;
  }

  interface Statement {
    run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: any[]): any;
    all(...params: any[]): any[];
    iterate(...params: any[]): IterableIterator<any>;
    bind(...params: any[]): Statement;
  }

  export default function(filename: string, options?: DatabaseOptions): Database;
} 