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
    query: { id: _id, choice: _choice, type: _type },
    method,
  } = req
  if (method !== "POST") {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${method} not allowed`)
  }
  if (_choice !== "smash" && _choice !== "pass") {
    return res.status(400).json({ error: "Invalid choice" })
  }
  if (_type && _type !== "switch" && _type !== "same") {
    return res.status(400).json({ error: "Invalid choice" })
  }

  try {
    const testId = Number(_id as string);
    if (isNaN(testId)) {
      return res.status(400).json({ error: "Invalid id" })
    }
  } catch (e) {
    return res.status(400).json({ error: "Invalid id" })
  }

  const id = Number(_id as string)
  const choice = _choice as "smash" | "pass"
  const otherChoice = choice === "smash" ? "pass" : "smash"
  const type: "switch" | "same" = _type as "switch" | "same"

  const session = await getSession({ req })
  const db = admin.database()
  const ref = db.ref(`/pokemon/${id}`);

  if (!session) {
    if (type === "same")
      return res.status(200).end()
    ref.transaction((current) => {
      if (current) {
        current[`${choice}Count`] = (current[`${choice}Count`] || 0) + 1;
        if (type === "switch") {
          current[`${otherChoice
            }Count`] = (current[`${otherChoice}Count`] || 0) - 1;
        }
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
        current[`${otherChoice}es`][id] = null
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
