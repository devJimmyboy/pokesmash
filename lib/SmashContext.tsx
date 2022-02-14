import { Box, FormControlLabel } from "@mui/material"
import { Pokemon } from "pokenode-ts"
import React, { PropsWithChildren } from "react"
import { useSessionStorage } from "react-use"
import useSWR, { mutate } from "swr"
import StyleSwitch from "../components/StyleSwitch"

interface CtxData {
  currentId: number
  setCurrentId: (id: number) => void
  pokeInfo: Pokemon | undefined
  style: "hd" | "showdown"
}
const SmashContext = React.createContext<CtxData | null>(null)
interface Props {}
const fetcher = async (url: string) => fetch(url).then((r) => r.json())
export default function SmashProvider(props: PropsWithChildren<Props>) {
  const [currentId, setCurrentId] = React.useState(1)
  const [style, setStyle] = useSessionStorage<"hd" | "showdown">("pokemonStyle", "showdown")

  const { error, isValidating, data: pokeInfo } = useSWR<Pokemon>(`/api/pokemon?id=${currentId}`, fetcher)

  React.useEffect(() => {
    prefetch(currentId)
  }, [currentId])

  return (
    <SmashContext.Provider value={{ currentId, setCurrentId, pokeInfo, style }}>
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
