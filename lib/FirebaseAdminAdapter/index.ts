//@ts-nocheck
import admin from "firebase-admin";
import { DocumentData, FirestoreDataConverter } from "firebase-admin/firestore";
import { Account } from 'next-auth';
import { Adapter, AdapterSession, AdapterUser, VerificationToken } from 'next-auth/adapters';
import { getConverter } from "./converter";

type IndexableObject = Record<string, unknown>;

declare module "firebase-admin/firestore" {
  interface CollectionReference<T extends DocumentData> {
    converter?: FirestoreDataConverter<T>;
  }
}

export const FirebaseAdminAdapter = (firebaseApp?: admin.app.App): Adapter => {
  const db = admin.firestore(firebaseApp);

  const Users = db.collection('users').withConverter(getConverter<Omit<AdapterUser, "id">>());
  const Sessions = db.collection('sessions').withConverter(
    getConverter<AdapterSession & IndexableObject>(),
  );
  const Accounts = db.collection('accounts').withConverter(getConverter<Account>());
  const VerificationTokens = db.collection('verificationTokens').withConverter(
    getConverter<VerificationToken & IndexableObject>({ excludeId: true }),
  );

  return {
    async createUser(newUser) {
      const userRef = await Users.add(newUser);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists && Users.converter) {
        return Users.converter.fromFirestore(userSnapshot);
      }

      throw new Error('[createUser] Failed to create user');
    },
    async getUser(id) {
      const userSnapshot = await Users.doc(id).get();

      if (userSnapshot.exists && Users.converter) {
        return Users.converter.fromFirestore(userSnapshot);
      }

      return null;
    },
    async getUserByEmail(email) {
      const userQuery = Users.where('email', '==', email).limit(1);
      const userSnapshots = await userQuery.get();
      const userSnpashot = userSnapshots.docs[0];

      if (userSnpashot?.exists && Users.converter) {
        return Users.converter.fromFirestore(userSnpashot);
      }

      return null;
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const accountQuery = Accounts.where('provider', '==', provider).where('providerAccountId', '==', providerAccountId).limit(1);
      const accountSnapshots = await accountQuery.get();
      const accountSnapshot = accountSnapshots.docs[0];

      if (accountSnapshot?.exists) {
        const { userId } = accountSnapshot.data();
        const userDoc = await Users.doc(userId).get();

        if (userDoc.exists && Users.converter) {
          return Users.converter.fromFirestore(userDoc);
        }
      }

      return null;
    },

    async updateUser(partialUser) {
      const userRef = Users.doc(partialUser.id as any);

      await userRef.set(partialUser, { merge: true });

      const userSnapshot = await userRef.get();

      if (userSnapshot.exists && Users.converter) {
        return Users.converter.fromFirestore(userSnapshot);
      }

      throw new Error('[updateUser] Failed to update user');
    },

    async deleteUser(userId) {
      const userRef = Users.doc(userId);
      const accountsQuery = Accounts.where('userId', '==', userId);
      const sessionsQuery = Sessions.where('userId', '==', userId);

      // TODO: May be better to use events instead of transactions?
      await db.runTransaction(async (transaction) => {
        const accounts = await accountsQuery.get();
        const sessions = await sessionsQuery.get();

        transaction.delete(userRef);
        accounts.forEach((account) => transaction.delete(account.ref));
        sessions.forEach((session) => transaction.delete(session.ref));
      });
    },

    async linkAccount(account) {
      const accountRef = await Accounts.add(account);
      const accountSnapshot = await accountRef.get();

      if (accountSnapshot.exists && Accounts.converter) {
        return Accounts.converter.fromFirestore(accountSnapshot);
      }
      else
        return null;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      const accountQuery =
        Accounts.where('provider', '==', provider).where('providerAccountId', '==', providerAccountId).limit(1)
      const accountSnapshots = await accountQuery.get();
      const accountSnapshot = accountSnapshots.docs[0];

      if (accountSnapshot?.exists) {
        await accountSnapshot.ref.delete();
      }
    },

    async createSession(session) {
      const sessionRef = await Sessions.add(session);
      const sessionSnapshot = await sessionRef.get();

      if (sessionSnapshot.exists && Sessions.converter) {
        return Sessions.converter.fromFirestore(sessionSnapshot);
      }

      throw new Error('[createSession] Failed to create session');
    },

    async getSessionAndUser(sessionToken) {
      const sessionQuery = Sessions.where('sessionToken', '==', sessionToken).limit(1);
      const sessionSnapshots = await sessionQuery.get();
      const sessionSnapshot = sessionSnapshots.docs[0];

      if (sessionSnapshot?.exists && Sessions.converter) {
        const session = Sessions.converter.fromFirestore(sessionSnapshot);
        const userDoc = await Users.doc(session.userId).get();

        if (userDoc.exists && Users.converter) {
          const user = Users.converter.fromFirestore(userDoc);

          return { session, user };
        }
      }

      return null;
    },

    async updateSession(partialSession) {
      const sessionQuery =
        Sessions.where('sessionToken', '==', partialSession.sessionToken).limit(1);
      const sessionSnapshots = await sessionQuery.get();
      const sessionSnapshot = sessionSnapshots.docs[0];

      if (sessionSnapshot?.exists) {
        await sessionSnapshot.ref.set(partialSession, { merge: true });

        const sessionDoc = await sessionSnapshot.ref.get();

        if (sessionDoc?.exists && Sessions.converter) {
          const session = Sessions.converter.fromFirestore(sessionDoc);

          return session;
        }
      }

      return null;
    },

    async deleteSession(sessionToken) {
      const sessionQuery = Sessions.where('sessionToken', '==', sessionToken).limit(1);
      const sessionSnapshots = await sessionQuery.get();
      const sessionSnapshot = sessionSnapshots.docs[0];

      if (sessionSnapshot?.exists) {
        await sessionSnapshot.ref.delete();
      }
    },

    async createVerificationToken(verificationToken) {
      const verificationTokenRef = await VerificationTokens.add(verificationToken);
      const verificationTokenSnapshot = await verificationTokenRef.get();

      if (verificationTokenSnapshot.exists && VerificationTokens.converter) {
        const { id, ...verificationToken } =
          VerificationTokens.converter.fromFirestore(verificationTokenSnapshot);

        return verificationToken;
      }
      else return null;
    },

    async useVerificationToken({ identifier, token }) {
      const verificationTokensQuery =
        VerificationTokens.where('identifier', '==', identifier).where('token', '==', token).limit(1);
      const verificationTokenSnapshots = await verificationTokensQuery.get();
      const verificationTokenSnapshot = verificationTokenSnapshots.docs[0];

      if (verificationTokenSnapshot?.exists && VerificationTokens.converter) {
        await verificationTokenSnapshot.ref.delete();

        const { id, ...verificationToken } =
          VerificationTokens.converter.fromFirestore(verificationTokenSnapshot);

        return verificationToken;
      }

      return null;
    },
  };
};