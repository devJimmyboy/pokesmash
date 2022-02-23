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
  const db = admin.firestore()
  const batch = db.batch();

  const scores = db.collection("scores")
  const pokemonDoc = db.collection("pokemon").doc(_id as string)


  batch.set(pokemonDoc, choice === "smash" ? {
    smashes: FieldValue.increment(1)
  } : { passes: FieldValue.increment(1) }, { merge: true })

  if (session) {
    const scoreDoc = scores.doc(session.user.name)
    await scoreDoc.get().then(doc => {
      const data = doc.data();
      let docSet: { choices: { [id: string]: string }, numCompleted?: number } = {
        choices: { [_id as string]: choice as string }
      }
      if ((data?.numCompleted === undefined || data.numCompleted < id)) {
        docSet.numCompleted = id;
      }
      batch.set(scoreDoc, docSet, { merge: true })
    })
  }
  await batch.commit()
  res.status(200).end();
}
