import NextAuth, { User } from "next-auth"
import TwitchProvider from "next-auth/providers/twitch";
import { FirebaseAdapter } from "../../../lib/FirebaseAdapter"
import { ClientCredentialsAuthProvider } from "@twurple/auth"
import { ApiClient, HelixUser } from "@twurple/api"

import { createFirebaseApp } from "../../../firebase/clientApp"

const app = createFirebaseApp();

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
  adapter: FirebaseAdapter(app),
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
    // async createUser({ user }) {
    //   const client = await clientPromise;
    //   const db = client.db();
    //   const scores = db.collection<ScoreSchema>("scores");
    // }
  }
})