// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Pokemon } from "pokenode-ts";

import api from "../../lib/pokemonapi";

import type { NextApiRequest, NextApiResponse } from 'next'
const base = 'https://pokeapi.co/api/v2/pokemon/'

type Data = Pokemon
const isDev = process.env.NODE_ENV !== 'production'
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (isDev) console.log('Asking for pokemon: ' + req.query.id)

  const id = Number(req.query.id as string)
  const pokemon = await api.pokemon.getPokemonById(id)
  res.status(200).json(pokemon)
}
