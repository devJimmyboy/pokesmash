import { Box, FormControlLabel } from "@mui/material"
import { child, get, getDatabase, onValue, ref, runTransaction, update } from "firebase/database"
import { getSession, useSession } from "next-auth/react"
import { Pokemon } from "pokenode-ts"
import React, { Dispatch, PropsWithChildren, SetStateAction, useEffect, useState } from "react"
import { useList, useLocalStorage } from "react-use"
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
  style: Styling | undefined
  error: any
  score: Score
  shockRef: React.RefObject<ShockRef>
  messages: FBMessage[]
  setMessages: ListActions<FBMessage> | undefined
  seenBefore: [boolean | undefined, Dispatch<SetStateAction<boolean | undefined>>, () => void]
  startCelebration: (force?: boolean) => Promise<void>
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
  seenBefore: [false, () => {}, () => {}],
  startCelebration: () => Promise.resolve(),
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
  const seenBefore = useLocalStorage<boolean>("seenCreditsBefore", false)

  const startCelebration = async (force?: boolean) => {
    if (seenBefore[0] && !force) return
    await gsap.to("#appControl", { autoAlpha: 0, duration: 7.5 })
    celebrateRef.current?.start()
  }

  useEffect(() => {
    const onRouteChange = (url: string, { shallow }: { shallow: boolean }) => {
      const bool = url.toString().match(/\/?((users|me)(\/.*?)?)?$/y)
      console.log(url, bool)

      setShowStyleSwitch(!!bool)
    }
    router.events.on("routeChangeStart", onRouteChange)
    return () => {
      router.events.off("routeChangeStart", onRouteChange)
    }
  }, [router.events])

  const { data: session, status } = useSession({ required: false })
  const [style, setStyle] = useLocalStorage<Styling>("pokemonStyle", "showdown")
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

  const [seenMessages, setSeenMessages] = useLocalStorage<string[]>("seenMessages", [])
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

    fetch(
      `/api/choice?id=${currentId}&choice=smash${
        !session && score.choices[`${currentId}`]
          ? `&type=${score.choices[`${currentId}`] === "pass" ? "switch" : "same"}`
          : ""
      }`,
      { method: "POST" }
    )
    setScore((prev) => {
      if (!prev.choices) prev.choices = {}
      if (prev.choices[`${currentId}`] === "pass") prev.passes--
      if (prev.choices[`${currentId}`] !== "smash") {
        prev.smashes++
        prev.choices[`${currentId}`] = "smash"
      }
      return prev
    })
  }, [currentId, session, pokeRef])
  const pass = React.useCallback(async () => {
    if (currentId > 898) return
    fetch(
      `/api/choice?id=${currentId}&choice=pass${
        !session && score.choices[`${currentId}`]
          ? `&type=${score.choices[`${currentId}`] === "smash" ? "switch" : "same"}`
          : ""
      }`,
      { method: "POST" }
    )
    setScore((prev) => {
      if (!prev.choices) prev.choices = {}

      if (prev.choices[`${currentId}`] === "smash") prev.smashes--
      if (prev.choices[`${currentId}`] !== "pass") {
        prev.passes++
        prev.choices[`${currentId}`] = "pass"
      }
      return prev
    })
  }, [currentId, session, pokeRef, score])

  // In app messages
  React.useEffect(() => {
    if (seenMessages && messages[0] && messages.filter((msg) => !seenMessages.includes(msg?.id)).length > 0) {
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
    if (currentId === 1) {
      get(ref(db, `users/${uid}/currentId`)).then((currentDbId) => setCurrentId(currentDbId.val()))
    }

    const userSmashRef = ref(db, `users/${uid}/smashCount`)
    const userPassRef = ref(db, `users/${uid}/passCount`)

    const unsubSmashCt = onValue(userSmashRef, (smashCount) => {
      if (!smashCount.exists()) return
      setScore((prev) => ({
        ...prev,
        smashes: smashCount.val() || 0,
      }))
    })
    const unsubPassCt = onValue(userPassRef, (passCount) => {
      if (!passCount.exists()) return
      setScore((prev) => ({
        ...prev,
        passCount: passCount.val() || 0,
      }))
    })
    return () => {
      unsubPassCt()
      unsubSmashCt()
      unsubMessages()
    }
  }, [session, setMessages])
  useEffect(() => {
    async function setScoreFromDb(storageScore: Score) {
      var newChoices:
        | { choices: { [key: string]: "smash" | "pass" }; smashCount: number; passCount: number; currentId: number }
        | undefined = undefined
      if (session) {
        const choices = await fetch(`/api/user/score?user=${session.user.name.toLowerCase()}`).then((v) => v.json())
        if (storageScore.currentId < choices.currentId) {
          if (choices !== "string") newChoices = choices
          else console.error("Error getting choices from db")
        }
      }
      setScore((prev) => {
        if (newChoices)
          return {
            ...prev,
            ...storageScore,
            choices: newChoices.choices,
            smashes: newChoices.smashCount,
            passes: newChoices.passCount,
            currentId: newChoices.currentId,
          }
        else return { ...prev, ...storageScore }
      })
      setCurrentId(newChoices?.currentId || storageScore.currentId)
    }
    const raw = localStorage.getItem("score")
    const storageScore = raw ? (JSON.parse(raw) as Score | null) : null
    if (storageScore) {
      setScoreFromDb(storageScore)
    }
  }, [session])
  useEffect(() => {
    localStorage.setItem("score", JSON.stringify(score))
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
        seenBefore,
        startCelebration,
      }}>
      <Celebration ref={celebrateRef} />
      <div id="appControl">
        {showStyleSwitch && (
          <Box className="absolute bottom-2 md:bottom-auto md:top-2 left-2">
            <StyleForm value={style || "showdown"} onChange={(s) => setStyle(s as Styling)} />
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
