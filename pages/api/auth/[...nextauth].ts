import NextAuth, { User } from "next-auth"
import TwitchProvider from "next-auth/providers/twitch";
import { ClientCredentialsAuthProvider } from "@twurple/auth"
import { ApiClient, HelixUser } from "@twurple/api"

import admin from "../../../firebase/adminApp";
//ts-ignore
import { FirebaseAdminAdapter } from "../../../lib/FirebaseAdminAdapter";

const app = admin.app();

const auth = new ClientCredentialsAuthProvider(process.env.TWITCH_ID as string, process.env.TWITCH_SECRET as string)
const api = new ApiClient({ authProvider: auth })

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_ID as string,
      clientSecret: process.env.TWITCH_SECRET as string,
      async profile(profile) {
        const userInfo = await api.users.getUserById(profile.sub) as HelixUser;
        const user: User = {
          id: profile.sub,
          name: profile.preferred_username?.toLowerCase() || userInfo.name,
          email: profile.email,
          username: userInfo.name,
          displayName: userInfo.displayName,
          description: userInfo.description,
          broadcasterType: userInfo.broadcasterType as any,
          profileImageUrl: userInfo.profilePictureUrl || profile.picture,
          offlineImageUrl: userInfo.offlinePlaceholderUrl,
          viewCount: userInfo.views,
          createdAt: userInfo.creationDate.toString(),
          type: userInfo.type,
        }
        return user;
      }
    }),
    // ...add more providers here
  ],
  adapter: FirebaseAdminAdapter(app),
  callbacks: {
    async session({ session, user }) {
      if (user.access_token)
        session.accessToken = user.access_token as string;
      // console.log("User Object:", user)
      session.user = user;
      return session
    },

  },
  events: {
    async signIn({ user }) {
      const db = admin.database();
      const userScoreRef = db.ref(`users/${user.name.toLowerCase()}`);
      await userScoreRef.get().then(scores => {
        if (!scores.exists()) {
          userScoreRef.set({
            currentId: 1,
            passCount: 0,
            smashCount: 0,
            passes: {},
            smashes: {}
          })
        }
      })
    },
    async createUser({ user }) {
      const db = admin.database();
      const userScoreRef = db.ref(`users/${user.name.toLowerCase()}`);
      await userScoreRef.set({
        currentId: 1,
        passCount: 0,
        smashCount: 0,
        passes: {},
        smashes: {}
      })

    }
  }
})