import { Box, FormControlLabel } from "@mui/material"
import { Pokemon } from "pokenode-ts"
import React, { PropsWithChildren } from "react"
import { useSessionStorage } from "react-use"
import useSWR, { mutate } from "swr"
import StyleSwitch from "../components/StyleSwitch"

interface Score {
  smashes: number
  passes: number
  hotTakes: number
  smash: () => Promise<Results>
  pass: () => Promise<Results>
}

export interface Results {
  id: number
  totalSmashes: number
  totalPasses: number
  total: number
}

interface CtxData {
  currentId: number
  setCurrentId: (id: number | ((id: number) => number)) => void
  pokeInfo: Pokemon | undefined
  style: "hd" | "showdown"
  error: any
  score: Score
}
const SmashContext = React.createContext<CtxData>({
  currentId: 1,
  setCurrentId: () => {},
  pokeInfo: undefined,
  style: "showdown",
  error: undefined,
  score: {
    smashes: 0,
    passes: 0,
    hotTakes: 0,
    async smash() {
      return { id: -1, totalSmashes: 0, totalPasses: 0, total: 0 }
    },
    async pass() {
      return { id: -1, totalSmashes: 0, totalPasses: 0, total: 0 }
    },
  },
})
interface Props {}
const fetcher = async (url: string) => fetch(url).then((r) => r.json())
export default function SmashProvider(props: PropsWithChildren<Props>) {
  const [currentId, setCurrentId] = React.useState<number>(1)
  const [style, setStyle] = useSessionStorage<"hd" | "showdown">("pokemonStyle", "showdown")
  const [score, setScore] = React.useState<Omit<Score, "smash" | "pass">>({ smashes: 0, passes: 0, hotTakes: 0 })

  const { error, isValidating, data: pokeInfo } = useSWR<Pokemon>(`/api/pokemon?id=${currentId}`, fetcher)

  const smash = React.useCallback(async () => {
    setScore((prev) => ({ ...prev, smashes: prev.smashes + 1 }))
    const body = new URLSearchParams({
      id: currentId.toString(),
      choice: "smash",
    })
    const res: Results = await fetch(`/api/choice?${body.toString()}`, {
      method: "POST",
    }).then((res) => res.json())
    return res
  }, [currentId])
  const pass = React.useCallback(async () => {
    setScore((prev) => ({ ...prev, passes: prev.passes + 1 }))
    const body = new URLSearchParams({
      id: currentId.toString(),
      choice: "pass",
    })
    const res: Results = await fetch(`/api/choice?${body.toString()}`, { method: "POST" }).then((res) => res.json())
    return res
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
  })

  React.useEffect(() => {
    setCtx({ currentId, setCurrentId, pokeInfo, style, error, score: { ...score, smash, pass } })
  }, [currentId, setCurrentId, pokeInfo, style, error, score])

  return (
    <SmashContext.Provider value={ctx}>
      <Box className="absolute top-2 left-2">
        <FormControlLabel
          sx={{ fontWeight: "bold", fontSize: "48px" }}
          control={<StyleSwitch style={style} onSwitch={() => setStyle(style === "hd" ? "showdown" : "hd")} />}
          label={style === "hd" ? "HD Style" : "Showdown Style"}
        />
      </Box>
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
