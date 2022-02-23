import { useTheme } from "@mui/material"
import {
  collection,
  doc,
  QuerySnapshot,
  DocumentData,
  getDoc,
  getDocs,
  getFirestore,
  query,
  getDocsFromServer,
  onSnapshot,
} from "firebase/firestore"
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
const db = getFirestore(app)
const pokemon = collection(db, "pokemon")

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function UserStats({}: Props) {
  const theme = useTheme()
  const { currentId, pokeInfo, style } = useSmash()
  const { data: prevPokemon } = useSWR(() => currentId > 1 && "/api/pokemon?id=" + `${currentId - 1}`, fetcher)
  const [pokeDocs, setDocs] = useState<QuerySnapshot<DocumentData>>()

  useEffect(() => {
    if (currentId % 100 === 0)
      getDocsFromServer(query(pokemon)).then((snap) => {
        setDocs(snap)
      })
  }, [currentId])

  useEffect(() => {
    getDocsFromServer(query(pokemon)).then((snap) => {
      setDocs(snap)
    })
  }, [])
  const [pokeDoc, setDoc] = useState<DocumentData>()
  const smashWidth = useAnimation()
  const passWidth = useAnimation()
  useEffect(() => {
    const doc = pokeDocs?.docs.find((v) => v.id === `${currentId - 1}`)
    if (doc?.exists()) {
      let docData = doc.data()
      setDoc(docData)
      let smashes = docData.smashes || 0
      let passes = docData.passes || 0
      smashWidth.start({ width: `${((smashes === 0 ? 0.1 : smashes) / (smashes + passes)) * 100}%` })
      passWidth.start({ width: `${((passes === 0 ? 0.1 : passes) / (smashes + passes)) * 100}%` })
    } else setDoc(undefined)
  }, [currentId, pokeDocs, smashWidth, passWidth])

  if (!prevPokemon || !pokeDoc) return null
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex flex-row w-full h-full items-center justify-center gap-2">
        <div className="flex flex-col items-end w-1/3">
          <span className="font-semibold text-lg">Passes</span>
          <motion.div
            style={{ borderRadius: 4, height: 32, backgroundColor: theme.palette.pass.main }}
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
              backgroundImage:
                currentId > 1
                  ? `url(${style === "hd" ? hdBuilder(currentId - 1) : showdownBuilder(currentId - 1)})`
                  : undefined,
              backgroundRepeat: "no-repeat",
              backgroundSize: "90%",
              backgroundPosition: "center",
              imageRendering: style === "hd" ? "auto" : "crisp-edges",
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
