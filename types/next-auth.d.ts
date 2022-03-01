import NextAuth, { DefaultSession, User } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken: string;
    user: User & DefaultSession["user"]
  }
  interface User {
    id: string;
    name: string;
    email?: string;
    username: string;
    displayName: string;
    description: string;
    type: "staff" | "admin" | "global_mod" | "";
    offlineImageUrl: string;
    profileImageUrl: string;
    broadcasterType: "partner" | "affiliate" | "";
    viewCount: number;
    createdAt: string;
  }
}
import { JWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string
    accessToken: string;

  }
}