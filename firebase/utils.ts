import { getDatabase, increment, ref, runTransaction, update } from "firebase/database";
import { Session } from "next-auth";

import { createFirebaseApp } from "./clientApp";

const app = createFirebaseApp()
const db = getDatabase(app)
export const onChoice = async ({ id, choice, type, session }: { id: number; choice: 'smash' | 'pass'; type?: 'switch' | 'same'; session: Session | null }) => {
  const otherChoice = choice === 'smash' ? 'pass' : 'smash'

  const pokemonRef = ref(db, `/pokemon/${id}`)

  if (type === 'same') return
  if (!session) {
    runTransaction(pokemonRef, (current) => {
      if (current) {
        current[`${choice}Count`] = (current[`${choice}Count`] || 0) + 1
        if (type === 'switch') {
          current[`${otherChoice}Count`] = (current[`${otherChoice}Count`] || 0) - 1
        }
      } else {
        current = {
          [`${choice}es`]: {},
          [`${otherChoice}es`]: {},
          [`${choice}Count`]: 1,
          [`${otherChoice}Count`]: 0,
        }
      }
      return current
    })

    return
  }
  const uid = session.user.name.toLowerCase()
  const userRef = ref(db, `/users/${uid}`)
  runTransaction(userRef, (current) => {
    if (current) {
      if (current[`${otherChoice}es`] && current[`${otherChoice}es`][id]) {
        current[`${otherChoice}Count`]--
        current[`${otherChoice}es`][id] = null
      }
      current[`${choice}Count`] = (current[`${choice}Count`] || 0) + 1
      if (current[`${choice}es`]) {
        current[`${choice}es`][id] = true
      } else {
        current[`${choice}es`] = { [id]: true }
      }
      if (!current.currentId || id + 1 > current.currentId) current.currentId = id + 1
    } else {
      current = {
        [`${choice}es`]: { [id]: true },
        [`${choice}Count`]: 1,
        [`${otherChoice}Count`]: 0,
        currentId: id + 1,
      }
    }
    return current
  })
  const pokeUpdates: { [key: string]: any } = {}
  pokeUpdates[`${choice}Count`] = increment(1)
  pokeUpdates[`${choice}es/${uid}`] = true
  if (type === 'switch') {
    pokeUpdates[`${otherChoice}Count`] = increment(-1)
    pokeUpdates[`${otherChoice}es/${uid}`] = null
  }

  return await update(pokemonRef, pokeUpdates)
}
