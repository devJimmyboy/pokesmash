import { Box, FormControlLabel } from "@mui/material"
import { Pokemon } from "pokenode-ts"
import React, { PropsWithChildren } from "react"
import { useSessionStorage } from "react-use"
import useSWR, { mutate } from "swr"
import ShockValue, { ShockRef } from "../components/ShockValue"
import StyleSwitch from "../components/StyleSwitch"

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
})
interface Props {}
const fetcher = async (url: string) => fetch(url).then((r) => r.json())
export default function SmashProvider(props: PropsWithChildren<Props>) {
  const [currentId, setCurrentId] = React.useState<number>(1)
  const [style, setStyle] = useSessionStorage<"hd" | "showdown">("pokemonStyle", "showdown")
  const [score, setScore] = React.useState<Omit<Score, "smash" | "pass">>({ smashes: 0, passes: 0, hotTakes: 0 })
  const shockRef = React.useRef<ShockRef>(null)

  const { error, isValidating, data: pokeInfo } = useSWR<Pokemon>(`/api/pokemon?id=${currentId}`, fetcher)

  const smash = React.useCallback(async () => {
    setScore((prev) => ({ ...prev, smashes: prev.smashes + 1 }))
    const body = new URLSearchParams({
      id: currentId.toString(),
      choice: "smash",
    })
    await fetch(`/api/choice?${body.toString()}`, {
      method: "POST",
    })
  }, [currentId])
  const pass = React.useCallback(async () => {
    setScore((prev) => ({ ...prev, passes: prev.passes + 1 }))
    const body = new URLSearchParams({
      id: currentId.toString(),
      choice: "pass",
    })
    await fetch(`/api/choice?${body.toString()}`, { method: "POST" })
  }, [currentId])

  React.useEffect(() => {
    prefetch(currentId)
  }, [currentId])
  const [ctx, setCtx] = React.useState<CtxData>({
    currentId,
    setCurrentId,
    pokeInfo,
    style,
    error,
    score: { ...score, smash, pass },
    shockRef,
  })

  React.useEffect(() => {
    setCtx({ currentId, setCurrentId, pokeInfo, style, error, score: { ...score, smash, pass }, shockRef })
  }, [currentId, setCurrentId, pokeInfo, style, error, score, shockRef, pass, smash])

  return (
    <SmashContext.Provider value={ctx}>
      <Box className="absolute top-2 left-2">
        <FormControlLabel
          sx={{ fontWeight: "bold", fontSize: "48px" }}
          control={<StyleSwitch style={style} onSwitch={() => setStyle(style === "hd" ? "showdown" : "hd")} />}
          label={style === "hd" ? "HD Style" : "Showdown Style"}
        />
      </Box>
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
