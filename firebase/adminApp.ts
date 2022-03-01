import * as admin from 'firebase-admin'
import { applicationDefault } from "firebase-admin/app"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string)),
    databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL,
  })
}

export default admin