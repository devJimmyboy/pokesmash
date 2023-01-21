import * as admin from 'firebase-admin'
import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import prompts from 'prompts'
import dotenv from 'dotenv'
console.log(process.cwd())

dotenv.config({ debug: true, path: path.resolve(process.cwd(), '.env.local') })

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string)), databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL as string })
const db = admin.database()

;(async () => {
  let response: prompts.Answers<string> = await prompts({
    type: 'number',
    name: 'pokemon',
    message: chalk.bold.cyan('How many pokemon to increase the db to?'),
    initial: 1,
  })

  const ids = response.pokemon
  console.log(chalk.bold.green('Adding', ids, 'pokemon...'))
  const pk = db.ref('/pokemon')
  const pokemon = await pk.orderByKey().get()
  // let lastId = 1
  for (let i = 1; i <= ids; i++) {
    const exists = pokemon.hasChild(`/${i}`)
    if (!exists) {
      console.log(`Pokemon ${i} doesn't exist. Creating...`)
      await pk.child(`/${i}`).set({
        passCount: 101,
        smashCount: 101,
      })
    } else {
      const data = pokemon.child(`/${i}`).val()
      let toUpdate: { smashCount?: number; passCount?: number } = {}
      if (data.smashCount <= 100) {
        toUpdate.smashCount = 101
      }
      if (data.passCount <= 100) {
        toUpdate.passCount = 101
      }
      if (Object.keys(toUpdate).length > 0) {
        console.log(`Pokemon ${i} exists but is not fully unlocked. Updating...`)
        await pk
          .child(`/${i}`)
          .update(toUpdate)
          .then(() => {
            console.log(chalk.bold.green(`Updated`, i))
          })
      }
    }
  }
})()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
