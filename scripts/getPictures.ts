// import * as admin from 'firebase-admin'
import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import prompts from 'prompts'
import { PokemonClient } from 'pokenode-ts'
import dotenv from 'dotenv'
import axios from 'axios'
console.log(process.cwd())

dotenv.config({ debug: true, path: path.resolve(process.cwd(), '.env.local') })

// admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string)), databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL as string })
// const db = admin.database()

const api = new PokemonClient({})

;(async () => {
  let response = await prompts([
    {
      type: 'number',
      name: 'pokemonStart',
      message: chalk.bold.cyan('Get sprites starting from which pokemon?'),
      initial: 899,
    },
    {
      type: 'number',
      name: 'pokemonEnd',
      message: chalk.bold.cyan('Get sprites ending at which pokemon?'),
      initial: 1010,
    },
  ])

  const start = response.pokemonStart as number
  const end = response.pokemonEnd as number
  console.log(chalk.bold.green(`Getting sprites for pokemon ${start} through ${end}...`))

  for (let i = start; i <= end; i++) {
    const pokemon = await api.getPokemonById(i)
    const name = pokemon.name.toLowerCase()
    const sprite = pokemon.sprites.front_default ?? getSpriteUrl(pokemon.id.toString())
    const spriteShiny = pokemon.sprites.front_shiny ?? getSpriteUrl(pokemon.id.toString(), true)
    const spritePath = path.resolve(process.cwd(), 'public', 'sprites', `${pokemon.id}.png`)
    const spritePathShiny = path.resolve(process.cwd(), 'public', 'sprites', `${pokemon.id}-shiny.png`)
    console.log(`Getting sprite for ${name}...`)
    if (fs.existsSync(spritePath) && fs.existsSync(spritePathShiny)) {
      console.log(chalk.bold.yellow(`Sprite for ${name} already exists`))
      continue
    }
    const spriteRes = await axios.get(sprite, { responseType: 'stream' }).catch((e) => {
      console.log(e)
      return null
    })
    if (!spriteRes) {
      console.log(chalk.bold.red(`Could not get sprite for ${name}`))
      continue
    }
    const spriteResShiny = await axios.get(spriteShiny, { responseType: 'stream' }).catch(() => spriteRes)
    spriteRes.data.on('error', (err: Error) => {
      console.log(err)
    })
    spriteResShiny.data.on('error', (err: Error) => {
      console.log(err)
    })
    const writer = fs.createWriteStream(spritePath)
    const writerShiny = fs.createWriteStream(spritePathShiny)
    spriteRes.data.pipe(writer)
    spriteResShiny.data.pipe(writerShiny)
    await Promise.all([
      new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      }),
      new Promise((resolve, reject) => {
        writerShiny.on('finish', resolve)
        writerShiny.on('error', reject)
      }),
    ])
  }
})()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

function getSpriteUrl(pokemon: string, shiny = false) {
  return shiny ? `https://www.serebii.net/Shiny/SV/new/${pokemon}.png` : `https://www.serebii.net/scarletviolet/pokemon/new/${pokemon}.png`
}
