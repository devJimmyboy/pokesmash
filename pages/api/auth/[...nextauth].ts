import NextAuth from "next-auth"
import TwitchProvider from "next-auth/providers/twitch"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../lib/mongodb"

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_ID as string,
      clientSecret: process.env.TWITCH_SECRET as string,
    }),
    // ...add more providers here
  ],
  adapter: MongoDBAdapter(clientPromise)
})