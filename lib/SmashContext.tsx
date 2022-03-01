import { Box, FormControlLabel } from "@mui/material"
import { child, getDatabase, onValue, ref, runTransaction } from "firebase/database"
import { getSession, useSession } from "next-auth/react"
import { Pokemon } from "pokenode-ts"
import React, { PropsWithChildren, useEffect } from "react"
import { useList, useSessionStorage } from "react-use"
import useSWR, { mutate } from "swr"
import ShockValue, { ShockRef } from "../components/ShockValue"
import StyleSwitch from "../components/StyleSwitch"
import { createFirebaseApp } from "../firebase/clientApp"
import { useRouter } from "next/router"

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
  smashes: number
  passes: number
  hotTakes: number
  smash: () => Promise<void>
  pass: () => Promise<void>
}

interface CtxData {
  currentId: number
  setCurrentId: (id: number | ((id: number) => number)) => void
  pokeInfo: Pokemon | undefined
  style: "hd" | "showdown"
  error: any
  score: Score
  shockRef: React.RefObject<ShockRef>
  messages: FBMessage[]
}
export type FBMessage = {
  data: {
    [key: string]: string
  }
}

const SmashContext = React.createContext<CtxData>({
  currentId: 1,
  setCurrentId: () => {},
  pokeInfo: undefined,
  style: "showdown",
  error: undefined,
  shockRef: { current: null },
  score: {
    smashes: 0,
    passes: 0,
    hotTakes: 0,
    async smash() {},
    async pass() {},
  },
  messages: [],
})

interface Props {}
const fetcher = async (url: string) => fetch(url).then((r) => r.json())
export default function SmashProvider(props: PropsWithChildren<Props>) {
  const app = createFirebaseApp()
  const router = useRouter()

  const db = getDatabase(app)
  const pokeRef = ref(db, `pokemon`)
  const [showStyleSwitch, setShowStyleSwitch] = React.useState(true)

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
  }, [])

  const { data: session, status } = useSession({ required: false })
  const [currentId, setCurrentId] = React.useState<number>(1)
  const [style, setStyle] = useSessionStorage<"hd" | "showdown">("pokemonStyle", "showdown")
  const [messages, setMessages] = useList<FBMessage>([])
  const [score, setScore] = React.useState<Omit<Score, "smash" | "pass">>({ smashes: 0, passes: 0, hotTakes: 0 })
  const shockRef = React.useRef<ShockRef>(null)

  const { error, isValidating, data: pokeInfo } = useSWR<Pokemon>(`/api/pokemon?id=${currentId}`, fetcher)

  const smash = React.useCallback(async () => {
    if (!session) {
      setScore((prev) => ({ ...prev, smashes: prev.smashes + 1 }))
      runTransaction(child(pokeRef, `${currentId}`), (current) => {
        if (current) {
          current.smashCount = (current.smashCount || 0) + 1
        } else {
          current = { smashes: {}, passes: {}, smashCount: 1, passCount: 0 }
        }
        return current
      })

      return
    }
    const uid = session.user.name.toLowerCase()
    await runTransaction(child(pokeRef, `${currentId}`), (current) => {
      if (current) {
        if (current.passes && current.passes[uid]) {
          current.passCount--
          current.passes[uid] = null
        }
        if (!current.smashes?.[uid]) {
          if (current.smashCount) current.smashCount++
          else current.smashCount = 1
          if (!current.smashes) {
            current.smashes = {}
          }
          current.smashes[uid] = true
        }
      } else {
        current = {
          smashes: {
            [uid]: true,
          },
          passes: {},
          smashCount: 1,
          passCount: 0,
        }
      }

      return current
    })
  }, [currentId, session, pokeRef])
  const pass = React.useCallback(async () => {
    if (!session) {
      setScore((prev) => ({ ...prev, passes: prev.passes + 1 }))
      runTransaction(child(pokeRef, `${currentId}`), (current) => {
        if (current) {
          current.passCount = (current.passCount || 0) + 1
        } else {
          current = { passes: {}, smashes: {}, passCount: 1, smashCount: 0 }
        }
        return current
      })

      return
    }
    const uid = session.user.name.toLowerCase()
    await runTransaction(child(pokeRef, `${currentId}`), (current) => {
      if (current) {
        if (current.smashes && current.smashes[uid]) {
          current.smashCount--
          current.smashes[uid] = null
        }
        if (!current.passes?.[uid]) {
          if (current.passCount) current.passCount++
          else current.passCount = 1
          if (!current.passes) {
            current.passes = {}
          }
          current.passes[uid] = true
        }
      } else {
        current = {
          smashes: {},
          passes: {
            [uid]: true,
          },
          smashCount: 0,
          passCount: 1,
        }
      }

      return current
    })
  }, [currentId, session, pokeRef])
  React.useEffect(() => {
    if (!session) return

    const uid = session.user.name.toLowerCase()
    const msgRef = ref(db, `messages/${uid}`)
    const unsubMessages = onValue(msgRef, (payload) => {
      if (!payload.exists()) return
      console.log("Message received. ", payload)
      payload.forEach((msg) => {
        setMessages.push(msg.val() as any)
      })
    })
    const unsub = onValue(pokeRef, (val) => {
      let smashes = 0
      let passes = 0
      val.forEach((pokemonSnapshot) => {
        // const pokeId = pokemonSnapshot.key
        const smashesRef = pokemonSnapshot.child(`smashes/${uid}`)
        const passesRef = pokemonSnapshot.child(`passes/${uid}`)
        if (smashesRef.val()) smashes++
        if (passesRef.val()) passes++
      })
      setScore((prev) => ({ ...prev, smashes, passes, hotTakes: smashes - passes < 0 ? 0 : smashes - passes }))
    })
    return () => {
      unsub()
      unsubMessages()
    }
  }, [session])

  React.useEffect(() => {
    prefetch(currentId)
  }, [currentId])

  return (
    <SmashContext.Provider
      value={{ currentId, setCurrentId, pokeInfo, style, error, score: { ...score, smash, pass }, shockRef, messages }}>
      {showStyleSwitch && (
        <Box className="absolute top-2 left-2">
          <FormControlLabel
            sx={{ fontWeight: "bold", fontSize: "48px" }}
            control={<StyleSwitch style={style} onSwitch={() => setStyle(style === "hd" ? "showdown" : "hd")} />}
            label={style === "hd" ? "HD Style" : "Showdown Style"}
          />
        </Box>
      )}
      <ShockValue ref={shockRef} />
      {props.children}
    </SmashContext.Provider>
  )
}

function prefetch(id: number) {
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
