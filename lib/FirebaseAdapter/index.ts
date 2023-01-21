//@ts-nocheck
import { FirebaseApp } from 'firebase/app'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, query, runTransaction, setDoc, where } from 'firebase/firestore'
import { Account } from 'next-auth'
import { Adapter, AdapterSession, AdapterUser, VerificationToken } from 'next-auth/adapters'

import { getConverter } from './converter'

type IndexableObject = Record<string, unknown>

export const FirebaseAdapter = (firebaseApp?: FirebaseApp): Adapter => {
  const db = getFirestore(firebaseApp)

  const Users = collection(db, 'users').withConverter(getConverter<AdapterUser>())
  const Sessions = collection(db, 'sessions').withConverter(getConverter<AdapterSession & IndexableObject>())
  const Accounts = collection(db, 'accounts').withConverter(getConverter<Account>())
  const VerificationTokens = collection(db, 'verificationTokens').withConverter(getConverter<VerificationToken & IndexableObject>({ excludeId: true }))

  return {
    async createUser(newUser) {
      const userRef = await addDoc(Users, newUser)
      const userSnapshot = await getDoc(userRef)

      if (userSnapshot.exists() && Users.converter) {
        return Users.converter.fromFirestore(userSnapshot)
      }

      throw new Error('[createUser] Failed to create user')
    },
    async getUser(id) {
      const userSnapshot = await getDoc(doc(Users, id))

      if (userSnapshot.exists() && Users.converter) {
        return Users.converter.fromFirestore(userSnapshot)
      }

      return null
    },
    async getUserByEmail(email) {
      const userQuery = query(Users, where('email', '==', email), limit(1))
      const userSnapshots = await getDocs(userQuery)
      const userSnpashot = userSnapshots.docs[0]

      if (userSnpashot?.exists() && Users.converter) {
        return Users.converter.fromFirestore(userSnpashot)
      }

      return null
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const accountQuery = query(Accounts, where('provider', '==', provider), where('providerAccountId', '==', providerAccountId), limit(1))
      const accountSnapshots = await getDocs(accountQuery)
      const accountSnapshot = accountSnapshots.docs[0]

      if (accountSnapshot?.exists()) {
        const { userId } = accountSnapshot.data()
        const userDoc = await getDoc(doc(Users, userId))

        if (userDoc.exists() && Users.converter) {
          return Users.converter.fromFirestore(userDoc)
        }
      }

      return null
    },

    async updateUser(partialUser) {
      const userRef = doc(Users, partialUser.id)

      await setDoc(userRef, partialUser, { merge: true })

      const userSnapshot = await getDoc(userRef)

      if (userSnapshot.exists() && Users.converter) {
        return Users.converter.fromFirestore(userSnapshot)
      }

      throw new Error('[updateUser] Failed to update user')
    },

    async deleteUser(userId) {
      const userRef = doc(Users, userId)
      const accountsQuery = query(Accounts, where('userId', '==', userId))
      const sessionsQuery = query(Sessions, where('userId', '==', userId))

      // TODO: May be better to use events instead of transactions?
      await runTransaction(db, async (transaction) => {
        const accounts = await getDocs(accountsQuery)
        const sessions = await getDocs(sessionsQuery)

        transaction.delete(userRef)
        accounts.forEach((account) => transaction.delete(account.ref))
        sessions.forEach((session) => transaction.delete(session.ref))
      })
    },

    async linkAccount(account) {
      const accountRef = await addDoc(Accounts, account)
      const accountSnapshot = await getDoc(accountRef)

      if (accountSnapshot.exists() && Accounts.converter) {
        return Accounts.converter.fromFirestore(accountSnapshot)
      } else return null
    },

    async unlinkAccount({ provider, providerAccountId }) {
      const accountQuery = query(Accounts, where('provider', '==', provider), where('providerAccountId', '==', providerAccountId), limit(1))
      const accountSnapshots = await getDocs(accountQuery)
      const accountSnapshot = accountSnapshots.docs[0]

      if (accountSnapshot?.exists()) {
        await deleteDoc(accountSnapshot.ref)
      }
    },

    async createSession(session) {
      const sessionRef = await addDoc(Sessions, session)
      const sessionSnapshot = await getDoc(sessionRef)

      if (sessionSnapshot.exists() && Sessions.converter) {
        return Sessions.converter.fromFirestore(sessionSnapshot)
      }

      throw new Error('[createSession] Failed to create session')
    },

    async getSessionAndUser(sessionToken) {
      const sessionQuery = query(Sessions, where('sessionToken', '==', sessionToken), limit(1))
      const sessionSnapshots = await getDocs(sessionQuery)
      const sessionSnapshot = sessionSnapshots.docs[0]

      if (sessionSnapshot?.exists() && Sessions.converter) {
        const session = Sessions.converter.fromFirestore(sessionSnapshot)
        const userDoc = await getDoc(doc(Users, session.userId))

        if (userDoc.exists() && Users.converter) {
          const user = Users.converter.fromFirestore(userDoc)

          return { session, user }
        }
      }

      return null
    },

    async updateSession(partialSession) {
      const sessionQuery = query(Sessions, where('sessionToken', '==', partialSession.sessionToken), limit(1))
      const sessionSnapshots = await getDocs(sessionQuery)
      const sessionSnapshot = sessionSnapshots.docs[0]

      if (sessionSnapshot?.exists()) {
        await setDoc(sessionSnapshot.ref, partialSession, { merge: true })

        const sessionDoc = await getDoc(sessionSnapshot.ref)

        if (sessionDoc?.exists() && Sessions.converter) {
          const session = Sessions.converter.fromFirestore(sessionDoc)

          return session
        }
      }

      return null
    },

    async deleteSession(sessionToken) {
      const sessionQuery = query(Sessions, where('sessionToken', '==', sessionToken), limit(1))
      const sessionSnapshots = await getDocs(sessionQuery)
      const sessionSnapshot = sessionSnapshots.docs[0]

      if (sessionSnapshot?.exists()) {
        await deleteDoc(sessionSnapshot.ref)
      }
    },

    async createVerificationToken(verificationToken) {
      const verificationTokenRef = await addDoc(VerificationTokens, verificationToken)
      const verificationTokenSnapshot = await getDoc(verificationTokenRef)

      if (verificationTokenSnapshot.exists() && VerificationTokens.converter) {
        const { id, ...verificationToken } = VerificationTokens.converter.fromFirestore(verificationTokenSnapshot)

        return verificationToken
      } else return null
    },

    async useVerificationToken({ identifier, token }) {
      const verificationTokensQuery = query(VerificationTokens, where('identifier', '==', identifier), where('token', '==', token), limit(1))
      const verificationTokenSnapshots = await getDocs(verificationTokensQuery)
      const verificationTokenSnapshot = verificationTokenSnapshots.docs[0]

      if (verificationTokenSnapshot?.exists() && VerificationTokens.converter) {
        await deleteDoc(verificationTokenSnapshot.ref)

        const { id, ...verificationToken } = VerificationTokens.converter.fromFirestore(verificationTokenSnapshot)

        return verificationToken
      }

      return null
    },
  }
}
