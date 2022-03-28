// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getSession } from "next-auth/react";

import admin from "../../../firebase/adminApp";

import type { NextApiRequest, NextApiResponse } from 'next'
type Data = { choices: { [id: string]: 'pass' | 'smash' }; smashCount: number; passCount: number; currentId: number } | string
const db = admin.database()

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { method } = req
  if (method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])
    return res.status(405).end(`Method ${method} not allowed`, 'utf-8')
  }
  const session = await getSession({ req })
  if (!session) return res.status(401).end(`Not logged in`, 'utf-8')
  const { user } = session
  const userRef = db.ref(`/users/${user.name.toLowerCase()}`)
  const userSnap = await userRef.get()
  if (!userSnap.exists()) {
    return res.status(400).send('User does not exist')
  }
  const deletedRef = db.ref('/deleted/' + user.name.toLowerCase())
  await deletedRef.set(userSnap.val())
  await userRef.set({ smashes: {}, passes: {}, smashCount: 0, passCount: 0, currentId: 1 })

  return res.status(200).end(`User ${user.name} deleted`, 'utf-8')
}
