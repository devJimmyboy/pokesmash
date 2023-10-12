import NextAuth, { User } from 'next-auth'
import TwitchProvider from 'next-auth/providers/twitch'
// import { FirebaseAdapter } from "../../../lib/FirebaseAdapter"
import { FirestoreAdapter } from '@next-auth/firebase-adapter'
import { AppTokenAuthProvider } from '@twurple/auth'
import { ApiClient, HelixUser } from '@twurple/api'

import admin from '../../../firebase/adminApp'
// import { createFirebaseApp } from '../../../firebase/clientApp'

// const app = createFirebaseApp()

const auth = new AppTokenAuthProvider(process.env.TWITCH_ID as string, process.env.TWITCH_SECRET as string)
const api = new ApiClient({ authProvider: auth })

export default NextAuth({
  // Configure one or more authentication providers
  theme: { colorScheme: 'dark' },
  debug: true,

  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_ID as string,
      clientSecret: process.env.TWITCH_SECRET as string,
      async profile(profile) {
        const userInfo = (await api.users.getUserById(profile.sub)) as HelixUser
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
          viewCount: 0,
          createdAt: userInfo.creationDate.toString(),
          type: userInfo.type,
        }
        return user
      },
    }),
    // ...add more providers here
  ],
  adapter: FirestoreAdapter({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string)),
    // apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    // appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    // authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    // messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    // emulator: {},
  }),
  callbacks: {
    async session({ session, user }) {
      if (user.access_token) session.accessToken = user.access_token as string
      // console.log("User Object:", user)
      session.user = user
      return session
    },
  },
  events: {
    async signIn({ user }) {
      const db = admin.database()
      const userScoreRef = db.ref(`users/${user.name.toLowerCase()}`)
      await userScoreRef.get().then((scores) => {
        if (!scores.exists()) {
          userScoreRef.set({
            currentId: 1,
            passCount: 0,
            smashCount: 0,
            passes: {},
            smashes: {},
          })
        }
      })
    },
    async createUser({ user }) {
      const db = admin.database()
      const userScoreRef = db.ref(`users/${user.name.toLowerCase()}`)
      await userScoreRef.set({
        currentId: 1,
        passCount: 0,
        smashCount: 0,
        passes: {},
        smashes: {},
      })
    },
  },
})
