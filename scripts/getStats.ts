import dotenv from 'dotenv'
import * as admin from 'firebase-admin'
import fs from 'fs'
import Listr, { ListrContext, ListrTaskWrapper } from 'listr'
import path from 'path'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

console.log(process.cwd())

dotenv.config({ debug: true })
let display: (string | number)[] | undefined
let sort: string
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string)), databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL as string })

yargs(hideBin(process.argv))
  .options({
    sort: { type: 'string', default: 'smashes', description: 'sort stats by...', choices: ['smashes', 'passes', 'choices', 'id'] },
    display: {
      type: 'array',
      choices: ['smashes', 'passes', 'id'],
    },
  })
  .describe('key', 'description')
  .parseAsync()
  .then((flags) => {
    display = flags.display
    sort = flags.sort
    listStats()
  })

const db = admin.database()

const pokemon = db.ref('pokemon')
interface UserData {
  currentId: number
  passCount: number
  passes: {
    [id: string]: boolean | null
  }
  smashCount: number
  smashes: {
    [id: string]: boolean | null
  }
}
async function listStats() {
  const newUserData: { [key: string]: UserData } = {}

  const tasks = new Listr([
    { title: `Reading old Pokemon Data`, task: main },
    { title: `Writing new Pokemon Data`, task: writeUserData },
  ])
  async function main(ctx: ListrContext, task: ListrTaskWrapper) {
    let user = (ctx.task.output = `Reading ${user}'s data`)
    const pokemonSnap = await pokemon.get()

    if (user && user !== 'all') {
      var pokeId = 1
      pokemonSnap.forEach((childSnapshot) => {
        if (!user) return
        const id = childSnapshot.key
        task.title = `Reading ${user}'s data - ${(Number(id) / 898).toFixed(2)}%`
        if (!id) return
        const childPasses = childSnapshot.child('passes')
        const childSmashes = childSnapshot.child('smashes')
        const userD = newUserData[user]

        const passed = childPasses.child(user).val() as boolean | null
        const smashed = childSmashes.child(user).val() as boolean | null
        if (userD) {
          if (passed) {
            userD.passCount++
            userD.passes[id] = passed
          }
          if (smashed) {
            userD.smashCount++
            userD.smashes[id] = smashed
          }
          if (Number(id) > userD.currentId && (smashed || passed)) userD.currentId = Number(id)
        } else {
          newUserData[user] = {
            currentId: Number(id),
            passCount: passed ? 1 : 0,
            smashCount: smashed ? 1 : 0,
            passes: {
              [id]: passed,
            },
            smashes: {
              [id]: smashed,
            },
          }
        }
      })
    } else {
      pokemonSnap.forEach(function (childSnapshot) {
        try {
          //@ts-expect-error
          const id = parseInt(childSnapshot.key)
          task.title = `Reading ${user}'s data - ${(id / 898).toFixed(2)}%`
          if (!id) return
          const childPasses = childSnapshot.child('passes')
          const childSmashes = childSnapshot.child('smashes')
          childPasses.forEach((user) => {
            const userId = user.key
            if (userId && user.val()) {
              const userD = newUserData[userId]
              if (userD) {
                if (id > userD.currentId) {
                  userD.currentId = id
                }
                userD.passCount += 1
                userD.passes[id] = true
              } else {
                newUserData[userId] = {
                  currentId: id,
                  passCount: 1,
                  smashCount: 0,
                  passes: {
                    [id]: true,
                  },
                  smashes: {},
                }
              }
            }
          })
          childSmashes.forEach((user) => {
            const userId = user.key
            if (userId && user.val()) {
              const userD = newUserData[userId]
              if (userD) {
                if (id > userD.currentId) {
                  userD.currentId = id
                }
                userD.passCount += 1
                userD.passes[id] = true
              } else {
                newUserData[userId] = {
                  currentId: id,
                  passCount: 1,
                  smashCount: 0,
                  passes: {
                    [id]: true,
                  },
                  smashes: {},
                }
              }
            }
          })
        } catch (e) {
          console.error(e)
          console.log('Errored on ' + childSnapshot.key)
        }
      })
    }

    task.title = `Reading ${user}'s data - 100%`
    task.output = ''
  }

  function writeUserData(ctx: ListrContext, task: ListrTaskWrapper) {
    task.output = `Writing newUserData`
    const serializedUser = JSON.stringify(newUserData)
    fs.writeFileSync(path.join(__dirname, `data.json`), serializedUser)
    if (user && user !== 'all') {
      const userRef = db.ref(`users/${user}`)
      userRef.update(newUserData[user])
    } else if (user === 'all') {
      const users = Object.keys(newUserData)
      users.forEach((user) => {
        const userRef = db.ref(`users/${user}`)
        userRef.update(newUserData[user])
      })
    }
    task.title = `Writing ${user}'s data - 100%`
    task.output = ''
  }

  tasks
    .run()
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
    .then(() => {
      process.exit(0)
    })
}

async function wipe() {
  const dataDir = path.join(__dirname, 'deletedData')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
  const userRef = db.ref(`users/${user}`)
  const userSnap = await userRef.get()
  const userVal = await userSnap.val()
  if (!userSnap.exists() && !userVal) {
    console.log('User does not exist')
    process.exit(1)
  }
  const userData = userVal as UserData
  await fs.promises
    .writeFile(path.resolve(dataDir, `${user}.json`), JSON.stringify(userData), { encoding: 'utf8' })
    .then(() => console.log('Wrote user data'))
    .catch((err) => console.error(err))
  console.log(`Wrote user data to ${dataDir}`)
  await userRef.remove()
}
