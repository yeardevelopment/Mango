declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      environment: 'dev' | 'prod' | 'debug';
    }
  }
}

export {};
