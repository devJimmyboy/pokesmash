// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Pokemon } from "pokenode-ts"
import api from "../../lib/pokemonapi"

const base = 'https://pokeapi.co/api/v2/pokemon/'

type Data = Pokemon

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const id = Number(req.query.id as string)
  const pokemon = await api.pokemon.getPokemonById(id)
  res.status(200).json(pokemon)
}
