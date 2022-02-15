namespace NodeJS {
  interface ProcessEnv extends NodeJS.ProcessEnv {
    TWITCH_ID: string;
    TWITCH_SECRET: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    MONGODB_URI: string;
  }
}