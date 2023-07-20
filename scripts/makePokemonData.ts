import dotenv from 'dotenv'
import * as admin from 'firebase-admin'
import fs from 'fs'
// import Listr, { ListrContext, ListrTaskWrapper } from 'listr'
import path, { resolve } from 'path'
import { PokemonClient } from 'pokenode-ts'
import { NUM_POKEMON } from '../src/constants'
// import { hideBin } from 'yargs/helpers'
// import yargs from 'yargs/yargs'

// console.log(process.cwd())

// dotenv.config({ debug: true })

const saveDataLocation = resolve(process.cwd(), './public/pokemon-names.json')

const api = new PokemonClient({})

console.log('Getting pokemon data...')
console.log("Saving to '" + saveDataLocation + "'")

async function getPokemonData() {
  const pokemonNames: string[] = ['N/A']
  for (let i = 1; i <= NUM_POKEMON; i++) {
    const pokemon = await api.getPokemonById(i).catch(async (e) => {
      console.log('Error getting ' + i)
      return api.getPokemonById(i).catch((e) => {
        return { name: 'N/A' }
      })
    })
    console.log('Got ' + pokemon.name)
    pokemonNames[i] = pokemon.name
  }
  fs.writeFileSync(saveDataLocation, JSON.stringify(pokemonNames))
}

getPokemonData()
