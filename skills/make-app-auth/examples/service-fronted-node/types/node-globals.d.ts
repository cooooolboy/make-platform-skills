declare const process: {
  env: Record<string, string | undefined>;
};

declare module 'node:fs' {
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function mkdtempSync(prefix: string): string;
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void;
  export function writeFileSync(path: string, data: string): void;
}

declare module 'node:os' {
  export function homedir(): string;
  export function tmpdir(): string;
}

declare module 'node:child_process' {
  export function execFileSync(
    file: string,
    args: string[],
    options?: {
      encoding?: 'utf8';
      env?: Record<string, string | undefined>;
      stdio?: ['ignore', 'pipe', 'ignore'];
    }
  ): string;
}
