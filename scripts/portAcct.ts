import * as admin from "firebase-admin";
import args from "args"
import Listr, { ListrContext, ListrTaskWrapper } from "listr";
import fs from "fs"
import path from "path";
import dotenv from "dotenv"
console.log(process.cwd());

dotenv.config({ debug: true })

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS as string)), databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL as string, });

args
  .option('user', 'Specify a user to update', 'devjimmyboy')
  .command('port', 'Serve your static site')

const flags = args.parse(process.argv)


const db = admin.database();

const pokemon = db.ref("pokemon");
interface UserData {
  currentId: number;
  passCount: number;
  passes: {
    [id: string]: boolean | null;
  }
  smashCount: number;
  smashes: {
    [id: string]: boolean | null;

  }
}

const newUserData: { [key: string]: UserData } = {

}


const tasks = new Listr([{ title: `Reading old Pokemon Data`, task: main }, { title: `Writing new Pokemon Data`, task: writeUserData }]);


async function main(ctx: ListrContext, task: ListrTaskWrapper) {
  const user = flags.user;
  task.output = `Reading ${user}'s data`


  if (flags.user && flags.user !== "all") {
    const childSnapshot =
    const id = childSnapshot.key;
    task.title = `Reading ${user}'s data - ${(Number(id) / 898).toFixed(2)}%`
    if (!id) return;
    const childPasses = childSnapshot.child('passes');
    const childSmashes = childSnapshot.child('smashes');
    const userD = newUserData[user]

    const passed = childPasses.child(user).val() as boolean | null;
    const smashed = childSmashes.child(user).val() as boolean | null;
    if (userD) {
      if (passed) {
        userD.passCount++;
        userD.passes[id] = passed;
      }
      if (smashed) {
        userD.smashCount++;
        userD.smashes[id] = smashed;
      }
      if (Number(id) > userD.currentId && (smashed || passed)) userD.currentId = Number(id)
    }
    else {
      newUserData[user] = {
        currentId: Number(id),
        passCount: passed ? 1 : 0,
        smashCount: smashed ? 1 : 0,
        passes: {
          [id]: passed
        },
        smashes: {
          [id]: smashed
        }
      }
    }
  }
  else {
    const pokemonSnap = await pokemon.get()

    pokemonSnap.forEach(function (childSnapshot) {
      const id = childSnapshot.key;
      task.title = `Reading ${user}'s data - ${(Number(id) / 898).toFixed(2)}%`
      if (!id) return;
      const childPasses = childSnapshot.child('passes');
      const childSmashes = childSnapshot.child('smashes');
      childPasses.forEach(user => {
        const userId = user.key;
        if (userId && user.val()) {
          const userD = newUserData[userId]
          if (userD) {
            if (Number(id) > userD.currentId) {
              userD.currentId = Number(id)
            }
            userD.passCount += 1;
            userD.passes[id] = true;
          }
          else {
            newUserData[userId] = {
              currentId: Number(id),
              passCount: 1,
              smashCount: 0,
              passes: {
                [id]: true
              },
              smashes: {}
            }
          }
        }
      })
      childSmashes.forEach(user => {
        const userId = user.key;
        if (userId && user.val()) {
          const userD = newUserData[userId]
          if (userD) {
            if (Number(id) > userD.currentId) {
              userD.currentId = Number(id)
            }
            userD.passCount += 1;
            userD.passes[id] = true;
          }
          else {
            newUserData[userId] = {
              currentId: Number(id),
              passCount: 1,
              smashCount: 0,
              passes: {
                [id]: true
              },
              smashes: {}
            }
          }
        }
      })
    })
  }

  task.title = `Reading ${user}'s data - 100%`
  task.output = ''
}

function writeUserData(ctx: ListrContext, task: ListrTaskWrapper) {
  const user = flags.user;
  task.output = `Writing newUserData`
  const serializedUser = JSON.stringify(newUserData)
  fs.writeFileSync(path.join(__dirname, `data.json`), serializedUser)
  if (user) {
    const userRef = db.ref(`users/${user}`)
    userRef.set(newUserData[user])
  }
  task.title = `Writing ${user}'s data - 100%`
  task.output = ''
}

tasks.run().catch(err => {
  console.error(err)
  process.exit(1)
}).then(() => { process.exit(0) })