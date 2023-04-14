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
  let response: prompts.Answers<string> = await prompts({
    type: 'number',
    name: 'pokemon',
    message: chalk.bold.cyan('How many top pokemon?'),
    initial: 1,
  })
  const topAmt = response.pokemon
  const ids = 1008
  console.log(chalk.bold.green('Getting top', topAmt, 'pokemon from', ids, '...'))
  const pk = db.ref('/pokemon')
  const pokemon = await pk.orderByKey().get()
  // let lastId = 1
  const topPokemon: { id: number; smashes: number; passes: number }[] = []
  for (let i = 1; i <= ids; i++) {
    const exists = pokemon.hasChild(`/${i}`)

    const passes = pokemon.child(`/${i}/passCount`).val()
    const smashes = pokemon.child(`/${i}/smashCount`).val()
    const total = passes + smashes

    topPokemon.push({ id: i, passes: passes / total, smashes: smashes / total })
  }
  const passes = [...topPokemon].sort((a, b) => {
    return b.passes - a.passes
  })
  const smashes = [...topPokemon].sort((a, b) => {
    return b.smashes - a.smashes
  })
  const topPokemonPassesNamed = await Promise.all(
    passes
      .slice(0, topAmt)
      .map((p) => p.id)
      .map((id) => {
        return api.getPokemonById(id)
      })
  )
  const topPokemonSmashesNamed = await Promise.all(
    smashes
      .slice(0, topAmt)
      .map((p) => p.id)
      .map((id) => {
        return api.getPokemonById(id)
      })
  )
  console.log(chalk.bold.green('Top', topAmt, 'pokemon by smashes:'))
  topPokemonSmashesNamed.forEach((p, i) => {
    console.log(i + 1, `${p.name} (${(smashes[i].smashes * 100).toFixed(2)}% smashes)`)
  })
  console.log(chalk.bold.green('Top', topAmt, 'pokemon by passes:'))
  topPokemonPassesNamed.forEach((p, i) => {
    console.log(i + 1, `${p.name} (${(passes[i].passes * 100).toFixed(2)}% passes)`)
  })
})()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
