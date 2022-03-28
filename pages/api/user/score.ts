// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import admin from "../../../firebase/adminApp";

import type { NextApiRequest, NextApiResponse } from 'next'
type Data = { choices: { [id: string]: 'pass' | 'smash' }; smashCount: number; passCount: number; currentId: number } | string
const db = admin.database()

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const {
    query: { user },
    method,
  } = req
  if (method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${method} not allowed`)
  }
  const userRef = db.ref(`/users/${user}`)
  const userSnap = await userRef.get()
  if (!userSnap.exists()) {
    return res.status(400).send('User does not exist')
  }

  let dbData = userSnap.val() as { smashCount: number; passCount: number; passes: { [key: string]: boolean | null }; smashes: { [key: string]: boolean | null }; currentId: number }
  let passes = dbData.passes && Object.keys(dbData.passes).filter((key) => dbData.passes && !!dbData.passes[key])
  let smashes = dbData.smashes && Object.keys(dbData.smashes).filter((key) => dbData.smashes && !!dbData.smashes[key])
  let currentId = dbData.currentId || 1
  let smashCount = dbData.smashCount || 0
  let passCount = dbData.passCount || 0
  let data: Exclude<Data, string> = {
    choices: {},
    smashCount,
    passCount,
    currentId,
  }
  passes?.forEach((key) => {
    data.choices[key] = 'pass'
  })
  smashes?.forEach((key) => {
    data.choices[key] = 'smash'
  })

  return res.status(200).json(data)
}
