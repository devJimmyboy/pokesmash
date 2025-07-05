import * as admin from 'firebase-admin'
import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import prompts from 'prompts'
import dotenv from 'dotenv'
import { PokemonClient } from 'pokenode-ts'
console.log(process.cwd())

dotenv.config({ debug: true, path: path.resolve(process.cwd(), '.env.local') })

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string)), databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL as string })
const db = admin.database()
const api = new PokemonClient({})
;(async () => {
  const ids = 1025
  console.log(chalk.bold.green('Getting data from', ids, ' ids...'))
  const pk = db.ref('/pokemon')
  const pokemon = await pk.orderByKey().get()
  // let lastId = 1
  const topPokemon: { id: number; smashes: number; passes: number }[] = []
  for (let i = 1; i <= ids; i++) {
    const exists = pokemon.hasChild(`/${i}`)

    const passes = pokemon.child(`/${i}/passCount`).val()
    const smashes = pokemon.child(`/${i}/smashCount`).val()
    const total = passes + smashes

    topPokemon.push({ id: i, passes: passes, smashes: smashes })
  }
  const allPokemonData = await Promise.all(
    topPokemon.map(async (p) => {
      const pokemon = await api.getPokemonById(p.id)
      return {
        id: p.id,
        name: pokemon.name,
        smashes: p.smashes,
        passes: p.passes,
      }
    })
  )
  fs.writeFileSync('./allPokemonStats.json', JSON.stringify(allPokemonData, null, 2), {
    encoding: 'utf-8',
  })
})()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
