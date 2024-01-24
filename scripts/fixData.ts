import * as admin from 'firebase-admin'
import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import prompts from 'prompts'
import dotenv from 'dotenv'
import { NUM_POKEMON } from '../src/constants'

console.log(process.cwd())

dotenv.config({ debug: true, path: path.join(process.cwd(), '.env.local') })

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string)), databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL as string })
const db = admin.database()

;(async () => {
  let response: prompts.Answers<string> = await prompts({
    type: 'number',
    name: 'pokemon',
    message: chalk.bold.cyan('Which pokemon ID would you like to edit?'),
    initial: 1,
    validate: (value) => (value < NUM_POKEMON && value > 0 ? true : 'Please enter a valid pokemon ID'),
  })
  const pokemonId = response.pokemon
  console.log(chalk.bold.green('Reading Pokemon #', response.pokemon, '...'))
  const pokeRef = db.ref(`/pokemon/${response.pokemon}`)
  const smashes = (await pokeRef.child('/smashCount').get()).val()
  const passes = (await pokeRef.child('/passCount').get()).val()
  const total = smashes + passes
  console.log(chalk.bold.green('Total:', total))
  console.log(chalk.bold.red('Passes:', passes), '\t', chalk.bold.green('Smashes:', smashes))
  response = await prompts([
    {
      type: 'select',
      name: 'toEdit',
      message: chalk.bold.cyan('Which value would you like to edit?'),
      initial: 0,
      choices: [
        { title: 'Smashes', value: 'smashCount' },
        { title: 'Passes', value: 'passCount' },
      ],
    },
    {
      type: 'number',
      name: 'valueToSet',
      message: (prev) => chalk.bold.cyan(`What value would you like to set for the ${prev === 'smashCount' ? 'Smashes' : 'Passes'}?`),
      initial: Math.round(total / 3),
      round: 0,
    },
  ])

  const valToEdit = response.toEdit
  const valueToSet = response.valueToSet
  response = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: chalk.bold.cyan(`Are you sure you want to set ${valToEdit} to ${valueToSet}?`),
    initial: true,
  })
  console.log(chalk.bold.green('Setting', valToEdit, 'to', valueToSet, '...'))
  if (response) {
    pokeRef.child(valToEdit).set(valueToSet)
    console.log(chalk.bold.green('Done!'))
    return
  } else {
    console.log(chalk.bold.red('Cancelled!'))
    throw new Error('Cancelled')
  }
})()
  .then(() => process.exit(0))
  .catch((e) => process.exit(1))
