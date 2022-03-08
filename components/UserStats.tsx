import { useTheme } from "@mui/material"
import { child, getDatabase, onValue, ref } from "firebase/database"
import { motion, useAnimation, useMotionValue } from "framer-motion"
import Image from "next/image"
import React, { useCallback, useEffect, useState } from "react"
import { useInterval } from "react-use"
import useSWR from "swr"
import { createFirebaseApp } from "../firebase/clientApp"
import { useSmash } from "../lib/SmashContext"
import { capitalizeWords, hdBuilder, showdownBuilder } from "../lib/utils"

type Props = {}

const app = createFirebaseApp()
const db = getDatabase(app)
const pokemon = ref(db, "pokemon")

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function UserStats({}: Props) {
  const theme = useTheme()
  const { currentId, pokeInfo, style } = useSmash()
  const { data: prevPokemon } = useSWR(() => currentId > 1 && "/api/pokemon?id=" + `${currentId - 1}`, fetcher)
  const [pokeDoc, setDoc] = useState<{ smashes: number; passes: number }>()

  const smashWidth = useAnimation()
  const passWidth = useAnimation()
  useEffect(() => {
    if (currentId >= 1) {
      const unsub = onValue(child(pokemon, `${currentId - 1}`), (snap) => {
        if (!snap.exists()) {
          setDoc(undefined)
        } else {
          let smashes = snap.child("smashCount").val()
          let passes = snap.child("passCount").val()
          setDoc({ smashes, passes })
        }
      })
      return () => {
        unsub()
      }
    }
  }, [currentId])

  useEffect(() => {
    let smashes = pokeDoc?.smashes || 0
    let passes = pokeDoc?.passes || 0
    smashWidth.start({ width: `${((smashes === 0 ? 0.1 : smashes) / (smashes + passes)) * 100}%` })
    passWidth.start({ width: `${((passes === 0 ? 0.1 : passes) / (smashes + passes)) * 100}%` })
  }, [smashWidth, passWidth, pokeDoc])
  if (!prevPokemon) return null
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex flex-row w-full h-full max-h-24 md:max-h-32 lg:max-h-screen items-center justify-center gap-2">
        <div className="flex flex-col items-end w-1/3">
          <span className="font-semibold text-lg">Passes</span>
          <motion.div
            style={{ borderRadius: 4, height: 32, backgroundColor: theme.palette.pass.main }}
            animate={passWidth}
          />
          <span className="font-semibold text-lg">{pokeDoc?.passes || 0}</span>
        </div>
        <div
          className="flex flex-col items-center justify-center h-24 md:h-32 aspect-square my-4 rounded-xl overflow-hidden"
          style={{
            border: `4px solid ${theme.palette.primary.main}`,
            backgroundImage: `url(/backgrounds/bg.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
          <div
            className="w-full h-full flex items-center justify-center  p-0 m-0"
            style={{
              backgroundImage:
                currentId > 1
                  ? `url(${style === "hd" ? hdBuilder(currentId - 1) : showdownBuilder(currentId - 1)})`
                  : undefined,
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
            style={{ borderRadius: 4, height: 32, backgroundColor: theme.palette.smash.main }}
            animate={smashWidth}></motion.div>
          <span className="font-semibold text-lg">{pokeDoc?.smashes || 0}</span>
        </div>
      </div>
      <span className="text-lg font-semibold">{capitalizeWords(prevPokemon?.name)}</span>
    </div>
  )
}
