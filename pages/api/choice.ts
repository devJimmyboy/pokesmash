// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { FieldValue } from "firebase-admin/firestore"
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, } from "next-auth/react"
import { Pokemon } from "pokenode-ts"
import admin from "../../firebase/adminApp"
import api from "../../lib/pokemonapi"


type Data = { error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const {
    query: { id: _id, choice },
    method,
  } = req
  if (req.method !== "POST") {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} not allowed`)
  }
  const id = Number(_id as string)


  const session = await getSession({ req })
  const db = admin.database()
  const ref = db.ref(`/pokemon/${id}`);
  const userScoreRef = session ? db.ref(`/scores/${session.user.id}/choices`) : null;
  const userScore = userScoreRef ? (await userScoreRef.get()) : null;
  const prevChoice = userScore?.exists() && userScore.val()[_id as string]


  const scores = ref.transaction(async (current) => {
    if (choice === "smash")
      return { smashes: (current.smashes || 0) + 1, passes: prevChoice === "pass" ? (current.passes || 0) - 1 : current.passes || 0 }
    else
      return { passes: (current.smashes || 0) + 1, smashes: prevChoice === "smash" ? (current.passes || 0) - 1 : current.passes || 0 }
  });

  res.status(200).end();
}
