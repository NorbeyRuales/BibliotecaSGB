declare const Deno: any;
declare const globalThis: any;

declare module 'npm:*' {
  const whatever: any;
  export = whatever;
}

declare module 'jsr:*' {
  const whatever: any;
  export = whatever;
}

interface Crypto {
  randomUUID?: () => string;
}

declare var crypto: Crypto;
