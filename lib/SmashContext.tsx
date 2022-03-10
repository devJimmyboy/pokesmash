import { Box, FormControlLabel } from "@mui/material"
import { child, get, getDatabase, onValue, ref, runTransaction, update } from "firebase/database"
import { getSession, useSession } from "next-auth/react"
import { Pokemon } from "pokenode-ts"
import React, { PropsWithChildren, useEffect, useState } from "react"
import { useList, useSessionStorage } from "react-use"
import useSWR, { mutate } from "swr"
import ShockValue, { ShockRef } from "../components/ShockValue"
import StyleForm from "../components/StyleForm"
import { createFirebaseApp } from "../firebase/clientApp"
import { useRouter } from "next/router"
import Chance from "chance"
import { ListActions } from "react-use/lib/useList"
import gsap from "gsap"
import Celebration, { CelebrationRef } from "../components/Celebration"
import { collection, CollectionReference, getFirestore, onSnapshot, query, where } from "firebase/firestore"
import toast from "react-hot-toast"
import { Icon } from "@iconify/react"
import { useObjectVal } from "react-firebase-hooks/database"

declare global {
  interface PokemonModel {
    smashes:
      | {
          [uid: string]: boolean | null
        }
      | undefined
    passes:
      | {
          [uid: string]: boolean | null
        }
      | undefined
    smashCount: number
    passCount: number
  }
}

interface Score {
  choices: {
    [id: string]: "smash" | "pass" | null
  }
  smashes: number
  passes: number
  currentId: number
  smash: () => Promise<void>
  pass: () => Promise<void>
}

export type Styling = "hd" | "showdown" | "3d" | "clean"

interface CtxData {
  chance: Chance.Chance
  currentId: number
  setCurrentId: (id: number | ((id: number) => number)) => void
  pokeInfo: Pokemon | undefined
  style: Styling
  error: any
  score: Score
  shockRef: React.RefObject<ShockRef>
  messages: FBMessage[]
  setMessages: ListActions<FBMessage> | undefined
}
export type FBMessage = {
  id: string
  title: string
  message: string
  icon?: string
  color?: string
  duration?: number
  for: string
  data?: {
    url?: string
  }
}

const SmashContext = React.createContext<CtxData>({
  currentId: 1,
  setCurrentId: () => {},
  chance: new Chance(),
  pokeInfo: undefined,
  style: "showdown",
  error: undefined,
  shockRef: { current: null },
  score: {
    choices: {},
    smashes: 0,
    passes: 0,
    currentId: 1,
    async smash() {},
    async pass() {},
  },
  messages: [],
  setMessages: undefined,
})

interface Props {}
const fetcher = async (url: string) => fetch(url).then((r) => r.json())
const app = createFirebaseApp()
const db = getDatabase(app)
const fs = getFirestore(app)

export default function SmashProvider(props: PropsWithChildren<Props>) {
  const router = useRouter()

  const pokeRef = ref(db, `pokemon`)
  const [showStyleSwitch, setShowStyleSwitch] = React.useState(true)
  const celebrateRef = React.useRef<CelebrationRef>(null)

  const startCelebration = async () => {
    await gsap.to("#appControl", { autoAlpha: 0, duration: 7.5 })
    celebrateRef.current?.start()
  }

  useEffect(() => {
    const onRouteChange = (url: string, { shallow }: { shallow: boolean }) => {
      const bool = url.toString().match(/\/?(users(\/.*?)?)?$/y)
      console.log(url, bool)

      setShowStyleSwitch(!!bool)
    }
    router.events.on("routeChangeStart", onRouteChange)
    return () => {
      router.events.off("routeChangeStart", onRouteChange)
    }
  }, [router.events])

  const { data: session, status } = useSession({ required: false })
  const [style, setStyle] = useSessionStorage<Styling>("pokemonStyle", "showdown")
  const [chance] = React.useState(new Chance())
  // useEffect(() => {
  //   if(session?.user?.id)
  //     setChance(new Chance(session?.user?.id))
  //   else
  //     setChance(new Chance())
  // }, [session])

  const [messages, setMessages] = useList<FBMessage>([])
  const [score, setScore] = useState<Omit<Score, "smash" | "pass">>({
    smashes: 0,
    passes: 0,
    currentId: 1,
    choices: {},
  })
  const [dbScore, loadingDbScore, errorDbStore] = useObjectVal(
    session ? ref(db, `users/${session.user.name.toLowerCase()}`) : null
  )

  const [seenMessages, setSeenMessages] = useSessionStorage<string[]>("seenMessages", [])
  const [currentId, setCurrentId] = React.useState<number>(score.currentId)
  const shockRef = React.useRef<ShockRef>(null)

  const {
    error,
    isValidating,
    data: pokeInfo,
  } = useSWR<Pokemon>(currentId > 898 ? null : `/api/pokemon?id=${currentId}`, fetcher)

  useEffect(() => {
    if (currentId < score.currentId) return
    setScore((prev) => ({ ...prev, currentId }))
    if (currentId > 898) {
      startCelebration()
    }
  }, [currentId])

  const smash = React.useCallback(async () => {
    if (currentId > 898) return

    fetch(`/api/choice?id=${currentId}&choice=smash`, { method: "POST" })
    setScore((prev) => {
      prev.smashes++
      if (!prev.choices) prev.choices = {}
      prev.choices[`${currentId}`] = "smash"
      if (prev.choices[`${currentId}`] === "pass") prev.passes--
      return prev
    })
  }, [currentId, session, pokeRef])
  const pass = React.useCallback(async () => {
    if (currentId > 898) return
    fetch(`/api/choice?id=${currentId}&choice=pass`, { method: "POST" })
    setScore((prev) => {
      prev.passes++
      if (!prev.choices) prev.choices = {}
      prev.choices[`${currentId}`] = "pass"
      if (prev.choices[`${currentId}`] === "smash") prev.smashes--
      return prev
    })
  }, [currentId, session, pokeRef])

  // In app messages
  React.useEffect(() => {
    if (messages[0] && messages.filter((msg) => !seenMessages.includes(msg?.id)).length > 0) {
      messages
        .filter((msg) => !seenMessages.includes(msg?.id))
        .forEach((msg, i) => {
          function runMsgToast() {
            toast(msg.message, {
              icon: <Icon icon={msg.icon || "fa-solid:comment"} />,
              style: { color: msg?.color },
              id: msg.id,
              duration: msg?.duration || 15000,
            })
          }
          if (i === 0) runMsgToast()
          else {
            setTimeout(runMsgToast, i * 1000)
          }
          setSeenMessages([...seenMessages, msg.id])
        })
    }
  }, [messages])

  React.useEffect(() => {
    const uid = session?.user.name.toLowerCase()
    const forArr = ["all"]
    if (uid) forArr.push(uid)
    const messages = query<FBMessage>(
      collection(fs, `messages`) as CollectionReference<FBMessage>,
      where("for", "in", forArr)
    )
    const unsubMessages = onSnapshot<FBMessage>(messages, (payload) => {
      if (payload.empty) return
      console.log("Messages received: ", payload.size)
      payload.forEach((msg) => {
        setMessages.push({ ...msg.data(), id: msg.id })
      })
    })
    if (!session) return
    const userRef = ref(db, `users/${uid}`)
    const unsub = onValue(userRef, (user) => {
      if (!user.exists()) return
      const smashCount = user.child("smashCount").val()
      const passCount = user.child("passCount").val()
      const _id = user.child("currentId").val()
      setScore((prev) => ({
        ...prev,
        smashes: smashCount || 0,
        passes: passCount || 0,
        currentId: _id || currentId,
      }))
      if (_id) setCurrentId(_id)
    })
    return () => {
      unsub()
      unsubMessages()
    }
  }, [session, setMessages])
  useEffect(() => {
    const raw = sessionStorage.getItem("score")
    const storageScore = raw ? (JSON.parse(raw) as Score | null) : null
    if (storageScore) {
      setScore(storageScore)
      setCurrentId(storageScore.currentId)
    }
  }, [])
  useEffect(() => {
    sessionStorage.setItem("score", JSON.stringify(score))
  }, [score])

  React.useEffect(() => {
    prefetch(currentId)
  }, [currentId])

  return (
    <SmashContext.Provider
      value={{
        setMessages,
        currentId,
        setCurrentId,
        pokeInfo,
        style,
        error,
        score: { ...score, smash, pass },
        shockRef,
        messages,
        chance,
      }}>
      <Celebration ref={celebrateRef} />
      <div id="appControl">
        {showStyleSwitch && (
          <Box className="absolute bottom-2 md:bottom-auto md:top-2 left-2">
            <StyleForm value={style} onChange={(s) => setStyle(s as Styling)} />
          </Box>
        )}

        <ShockValue ref={shockRef} />
        {props.children}
      </div>
    </SmashContext.Provider>
  )
}

function prefetch(id: number) {
  if (id >= 898) return
  mutate(
    `/api/pokemon?id=${id + 1}`,
    fetch(`/api/pokemon?id=${id + 1}`).then((res) => res.json())
  )
  // the second parameter is a Promise
  // SWR will use the result when it resolves
}

export function useSmash() {
  const ctx = React.useContext(SmashContext)
  return ctx
}
