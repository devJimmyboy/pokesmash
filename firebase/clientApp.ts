import { initializeApp, getApps, FirebaseOptions, FirebaseApp, getApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getPerformance } from 'firebase/performance'
import { enableLogging, getDatabase } from "firebase/database";

const isDev = process.env.NODE_ENV === 'development';

export const createFirebaseApp = () => {
  const clientCredentials: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }
  let app: FirebaseApp;
  if (getApps().length <= 0) {
    app = initializeApp(clientCredentials)
    // Check that `window` is in scope for the analytics module!
    if (typeof window !== 'undefined') {
      // Enable analytics. https://firebase.google.com/docs/analytics/get-started
      if ('measurementId' in clientCredentials) {
        getAnalytics()
      }
      // Initialize Performance Monitoring and get a reference to the service
      const perf = getPerformance(app);

    }
  }
  else {
    app = getApps()[0] || getApp()
  }



  if (isDev) {
    // const functions = getFunctions(app);
    // const firestore = getFirestore(app)
    // const db = getDatabase(app);
    enableLogging(true)
    // connectFunctionsEmulator(functions, "localhost", 5001);
    // connectFirestoreEmulator(firestore, 'localhost', 8080);
    // // Point to the RTDB emulator running on localhost.
    // connectDatabaseEmulator(db, "localhost", 9000);
  }
  return app
}

