// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, } from "next-auth/react"
import { Pokemon } from "pokenode-ts"
import clientPromise, { PokemonSchema, ScoreSchema } from "../../lib/mongodb"
import api from "../../lib/pokemonapi"
import { Results } from "../../lib/SmashContext"


type Data = Partial<Results> | { error: string }

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
  let results: Partial<Results> & { id: number } = { id }
  const client = await clientPromise;
  const db = client.db();
  const pokemon = db.collection<PokemonSchema>("pokemon")
  const scores = db.collection<ScoreSchema>("scores")


  pokemon.findOneAndUpdate({ _id: results.id }, { $inc: choice === "smash" ? { smashes: 1, passes: 0 } : { passes: 1, smashes: 0 } }, { upsert: true, }).then(doc => {
    if (doc.ok) {
      results = { ...results, totalPasses: doc.value?.passes, totalSmashes: doc.value?.smashes, total: (doc.value?.smashes || 0) + (doc.value?.passes || 0) }
    } else {
      res.status(500).json({ error: "Error updating document" })
    }
  })
  if (session) {
    scores.findOneAndUpdate({ id: session.user.name }, {
      $set: { [`choices.${results.id}`]: choice }, $max: {
        numCompleted:
          id
      }
    }, { upsert: true, }).then(doc => {
      if (!doc.ok) {
        res.status(500).json({ error: "Error updating user score document" })
      }
    })
  }
  res.status(200).json(results)
}
