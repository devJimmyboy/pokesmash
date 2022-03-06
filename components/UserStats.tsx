import { useTheme } from "@mui/material"
import { child, getDatabase, onValue, ref } from "firebase/database"
import { motion, useAnimation, useMotionValue } from "framer-motion"
import Image from "next/image"
import { Pokemon } from "pokenode-ts"
import React, { useCallback, useEffect, useState } from "react"
import { useInterval } from "react-use"
import useSWR from "swr"
import { createFirebaseApp } from "../firebase/clientApp"
import { useSmash } from "../lib/SmashContext"
import { capitalizeWords, usePokemonPicture } from "../lib/utils"
import { PokeType, typeToColor } from "./Type"

type Props = {}

const app = createFirebaseApp()
const db = getDatabase(app)
const pokemon = ref(db, "pokemon")

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function UserStats({}: Props) {
  const theme = useTheme()
  const { currentId, style } = useSmash()
  const { data: prevPokemon } = useSWR<Pokemon, null>(
    () => currentId > 1 && "/api/pokemon?id=" + `${currentId - 1}`,
    fetcher
  )
  const [pokeDoc, setDoc] = useState<{ smashes: number; passes: number }>()
  const { bgUrl: sprite, shiny } = usePokemonPicture(currentId - 1)
  const smashWidth = useAnimation()
  const passWidth = useAnimation()
  useEffect(() => {
    if (currentId >= 1) {
      const unsub = [
        onValue(child(pokemon, `${currentId - 1}/smashCount`), (snap) => {
          if (snap.exists()) {
            setDoc((prev) => (prev ? { ...prev, smashes: snap.val() } : { smashes: snap.val(), passes: 0 }))
          }
        }),
        onValue(child(pokemon, `${currentId - 1}/passCount`), (snap) => {
          if (snap.exists()) {
            setDoc((prev) => (prev ? { ...prev, passes: snap.val() } : { passes: snap.val(), smashes: 0 }))
          }
        }),
      ]
      return () => {
        unsub.forEach((list) => {
          list()
        })
      }
    }
    return () => {}
  }, [currentId])

  useEffect(() => {
    if (currentId <= 1) return
    if (!pokeDoc) {
      smashWidth.set({ width: "0.1%" })
      passWidth.set({ width: "0.1%" })
    }
    let smashes = pokeDoc?.smashes || 0
    let passes = pokeDoc?.passes || 0
    smashWidth.start({ width: `${((smashes === 0 ? 0.1 : smashes) / (smashes + passes)) * 100}%` })
    passWidth.start({ width: `${((passes === 0 ? 0.1 : passes) / (smashes + passes)) * 100}%` })
  }, [smashWidth, passWidth, pokeDoc])

  return (
    <div className={`flex-col items-center gap-0.5`} style={{ display: currentId === 1 ? "none" : "flex" }}>
      {prevPokemon && (
        <span className="text-lg font-semibold">
          What Others Chose for{" "}
          <span style={{ color: typeToColor[prevPokemon.types[0].type.name as PokeType] }}>
            {capitalizeWords(prevPokemon.name)}
          </span>
          ...
        </span>
      )}
      <div className="flex flex-row w-full h-full items-center justify-center gap-2">
        <div className="flex flex-col items-end w-1/3">
          <span className="font-semibold text-lg">Passes</span>
          <motion.div
            style={{ borderRadius: 4, height: 32, backgroundColor: theme.palette.pass.main, width: "0.1%" }}
            animate={passWidth}
          />
          <span className="font-semibold text-lg">{pokeDoc?.passes || 0}</span>
        </div>
        <div
          className="flex flex-col items-center justify-center h-32 aspect-square my-4 rounded-xl overflow-hidden"
          style={{
            border: `4px solid ${theme.palette.primary.main}`,
            backgroundImage: `url(/backgrounds/bg.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
          <div
            className="w-full h-full flex items-center justify-center  p-0 m-0"
            style={{
              backgroundImage: currentId > 1 ? `url(${sprite})` : undefined,
              backgroundRepeat: "no-repeat",
              backgroundSize: "90%",
              backgroundPosition: "center",
              imageRendering: style === "hd" ? "auto" : "pixelated",
            }}
          />
        </div>
        <div className="flex flex-col w-1/3">
          <span className="font-semibold text-lg">Smashes</span>
          <motion.div
            style={{ borderRadius: 4, height: 32, backgroundColor: theme.palette.smash.main, width: "0.1%" }}
            animate={smashWidth}></motion.div>
          <span className="font-semibold text-lg">{pokeDoc?.smashes || 0}</span>
        </div>
      </div>
    </div>
  )
}
