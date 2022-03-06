// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, } from "next-auth/react"
import admin from "../../firebase/adminApp"


type Data = { error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const {
    query: { id: _id, choice: _choice },
    method,
  } = req
  if (req.method !== "POST") {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} not allowed`)
  }
  const id = Number(_id as string)
  const choice = _choice as "smash" | "pass"
  const otherChoice = choice === "smash" ? "pass" : "smash"

  const session = await getSession({ req })
  const db = admin.database()
  const ref = db.ref(`/pokemon/${id}`);

  if (!session) {
    ref.transaction((current) => {
      if (current) {
        current[`${choice}Count`] = (current[`${choice}Count`] || 0) + 1
      } else {
        current = {
          [`${choice}es`]: {}, [`${otherChoice
            }es`]: {}, [`${choice
              }Count`]: 1, [`${otherChoice
                }Count`]: 0
        }
      }
      return current
    })

    return res.status(200).end()
  }
  const uid = session.user.name.toLowerCase()
  const userRef = db.ref(`/users/${uid}`)
  userRef.transaction((current) => {
    if (current) {
      if (current[`${otherChoice}es`] && current[`${otherChoice}es`][id]) {
        current[`${otherChoice}Count`]--
        current[`${otherChoice}es`][uid] = null
      }
      current[`${choice}Count`] = (current[`${choice}Count`] || 0) + 1
      if (current[`${choice}es`]) {
        current[`${choice}es`][id] = true
      }
      else {
        current[`${choice}es`] = { [id]: true }
      }
      if (!current.currentId || id + 1 > current.currentId)
        current.currentId = id + 1
    } else {
      current = {
        [`${choice}es`]: { [id]: true },
        [`${choice}Count`]: 1,
        [`${otherChoice}Count`]: 0,
        currentId: id + 1
      }
    }
    return current
  })
  return await ref.transaction((current) => {
    if (current) {
      if (current[`${otherChoice}es`] && current[`${otherChoice}es`][uid]) {
        current[`${otherChoice}Count`]--
        current[`${otherChoice}es`][uid] = null
      }
      if (!current[`${choice}es`]?.[uid]) {
        if (current[`${choice}Count`]) current[`${choice}Count`]++
        else current[`${choice}Count`] = 1
        if (!current[`${choice}es`]) {
          current[`${choice}es`] = {}
        }
        current[`${choice}es`][uid] = true
      }
    } else {
      current = {
        [`${choice}es`]: {
          [uid]: true,
        },
        [`${choice}es`]: {},
        [`${choice}Count`]: 1,
        [`${otherChoice}Count`]: 0,
      }
    }

    return current
  }).then(() => {
    return res.status(200).end();
  }).catch((e) => {
    return res.status(504).end()
  })


}
