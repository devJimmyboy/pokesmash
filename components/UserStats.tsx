import { useTheme } from "@mui/material";
import { child, getDatabase, ref } from "firebase/database";
import { motion, useAnimation } from "framer-motion";
import { Pokemon } from "pokenode-ts";
import React, { useCallback, useEffect, useState } from "react";
import { useObjectVal } from "react-firebase-hooks/database";
import useSWR from "swr";

import { createFirebaseApp } from "../firebase/clientApp";
import { pokeClient, useSmash } from "../lib/SmashContext";
import { capitalizeWords, usePokemonPicture } from "../lib/utils";
import { PokeType, typeToColor } from "./Type";

type Props = {}

const app = createFirebaseApp()
const db = getDatabase(app)
const pokemon = ref(db, 'pokemon')

export default function UserStats({}: Props) {
  const theme = useTheme()
  const { currentId, style } = useSmash()
  const { data: prevPokemon } = useSWR<Pokemon, null>(
    () => currentId > 1 && `${currentId - 1}`,
    (id: string) => pokeClient.getPokemonById(Number(id))
  )
  const [pokeSmashes, loadingS, errorS] = useObjectVal<number>(currentId > 1 ? child(pokemon, `${currentId - 1}/smashCount`) : null)
  const [pokePasses, loadingP, errorP] = useObjectVal<number>(currentId > 1 ? child(pokemon, `${currentId - 1}/passCount`) : null)

  const { bgUrl: sprite, shiny } = usePokemonPicture(currentId - 1)
  const smashWidth = useAnimation()
  const passWidth = useAnimation()

  useEffect(() => {
    if (pokeSmashes && pokePasses) {
      let smashes = pokeSmashes
      let passes = pokePasses
      let smashNum = ((smashes / (smashes + passes)) * 100).toFixed(3)
      let passNum = ((passes / (smashes + passes)) * 100).toFixed(3)

      if (!smashNum.match('Infinity')) smashWidth.start({ width: `${smashNum}%` })
      if (!passNum.match('Infinity')) passWidth.start({ width: `${passNum}%` })
    }
  }, [smashWidth, passWidth, pokePasses, pokeSmashes])
  if (errorS || errorP) return null

  return (
    <div className={`flex-col items-center gap-0.5`} style={{ display: currentId === 1 ? 'none' : 'flex' }}>
      {prevPokemon && (
        <span className="text-lg font-semibold">
          What Others Chose for <span style={{ color: typeToColor[prevPokemon.types[0].type.name as PokeType] }}>{capitalizeWords(prevPokemon.name)}</span>
          ...
        </span>
      )}
      <div className="flex flex-row w-full h-full items-center justify-center gap-2">
        <div className="flex flex-row w-full h-full max-h-24 md:max-h-32 lg:max-h-screen items-center justify-center gap-2">
          <div className="flex flex-col items-end w-1/3">
            <span className="font-semibold text-lg">Passes</span>
            <motion.div style={{ borderRadius: 4, height: 32, backgroundColor: theme.palette.pass.main, width: '0.1%' }} animate={passWidth} />
            <span className="font-semibold text-lg">{pokePasses || 0}</span>
          </div>
          <div
            className="flex flex-col items-center justify-center h-24 md:h-32 aspect-square my-4 rounded-xl overflow-hidden"
            style={{
              border: `4px solid ${theme.palette.primary.main}`,
              backgroundImage: `url(/backgrounds/bg.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
            <div
              className="w-full h-full flex items-center justify-center  p-0 m-0"
              style={{
                backgroundImage: currentId > 1 ? `url(${sprite})` : undefined,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '90%',
                backgroundPosition: 'center',
                imageRendering: style === 'hd' ? 'auto' : 'pixelated',
              }}
            />
          </div>
          <div className="flex flex-col w-1/3">
            <span className="font-semibold text-lg">Smashes</span>
            <motion.div style={{ borderRadius: 4, height: 32, backgroundColor: theme.palette.smash.main, width: '0.1%' }} animate={smashWidth}></motion.div>
            <span className="font-semibold text-lg">{pokeSmashes || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
