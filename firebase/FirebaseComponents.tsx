import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { PropsWithChildren } from "react";
import { AuthProvider, DatabaseProvider, useFirebaseApp } from "reactfire";

export default function FirebaseComponents({ children }: PropsWithChildren<{}>) {
  const app = useFirebaseApp() // a parent component contains a `FirebaseAppProvider`

  // initialize Database and Auth with the normal Firebase SDK functions
  const database = getDatabase(app)
  const auth = getAuth(app)

  // any child components will be able to use `useUser`, `useDatabaseObjectData`, etc
  return (
    <AuthProvider sdk={auth}>
      <DatabaseProvider sdk={database}>{children}</DatabaseProvider>
    </AuthProvider>
  )
}
