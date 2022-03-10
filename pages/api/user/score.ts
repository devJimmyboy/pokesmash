// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, } from "next-auth/react"
import admin from "../../../firebase/adminApp"


type Data = { choices: { [id: string]: "pass" | "smash" }, smashCount: number, passCount: number } | string;
const db = admin.database()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const {
    query: { user },
    method,
  } = req
  if (method !== "GET") {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${method} not allowed`)
  }
  const userRef = db.ref(`/users/${user}`);
  const userSnap = await userRef.get()
  if (!userSnap.exists()) {
    return res.status(400).send("User does not exist")
  }

  let dbData = userSnap.val() as { smashCount: number, passCount: number, passes: { [key: string]: boolean | null }, smashes: { [key: string]: boolean | null } }
  let passes = Object.keys(dbData.passes).filter(key => dbData.passes && !!dbData.passes[key])
  let smashes = Object.keys(dbData.smashes).filter(key => dbData.smashes && !!dbData.smashes[key])
  let smashCount = dbData.smashCount
  let passCount = dbData.passCount
  let data: Exclude<Data, string> = {
    choices: {},
    smashCount,
    passCount,
  }
  passes.forEach(key => {
    data.choices[key] = "pass"
  })
  smashes.forEach(key => {
    data.choices[key] = "smash"
  })

  return res.status(200).json(data)

}
