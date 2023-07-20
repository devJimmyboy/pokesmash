// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import { NextRequest } from 'next/server'
import admin from '../../../firebase/adminApp'

import type { NextApiRequest, NextApiResponse } from 'next'
import { NUM_POKEMON } from '../../../src/constants'
import pokemonNames from '../../../public/pokemon-names.json'

type Data = { id: number; name: string; smashes: number; passes: number }[] | string
const db = admin.database()

// Cache each day
// export const config = {
//   type: '',
// }
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { method } = req
  if (method !== 'GET') {
    return new Response(`Method ${method} not allowed`, { status: 405 })
  }

  const pk = db.ref('/pokemon')
  const pokemon = await pk.orderByKey().get()
  // let lastId = 1
  const topPokemon: { id: number; name: string; smashes: number; passes: number }[] = []
  for (let i = 1; i <= NUM_POKEMON; i++) {
    // const exists = pokemon.hasChild(`/${i}`)

    const passes = pokemon.child(`/${i}/passCount`).val()
    const smashes = pokemon.child(`/${i}/smashCount`).val()
    const total = passes + smashes

    topPokemon.push({ id: i, name: pokemonNames[i], passes: passes, smashes: smashes })
  }

  return res.status(200).setHeader('Content-Type', 'application/json').setHeader('cache-control', 'public, s-maxage=12000, stale-while-revalidate=60000').json(topPokemon)
}
