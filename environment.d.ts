declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      guildId: string;
      environment: 'dev' | 'prod' | 'debug';
    }
  }
}

export {};
