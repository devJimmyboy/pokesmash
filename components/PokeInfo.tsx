import { Card, CardContent, CardHeader, CircularProgress, Stack, Typography } from "@mui/material"
import { styled, css } from "@mui/system"
import { PokemonSpecies } from "pokenode-ts"
import { Ref, RefObject, useRef, useState } from "react"
import TinderCard from "react-tinder-card"
import useSWR from "swr"
import { useSmash } from "../lib/SmashContext"

import { capitalizeFirstLetter } from "../lib/utils"
import SwipeCards from "./SwipeCards"
import Type, { PokeType } from "./Type"

type Props = { cardRef: RefObject<any> }

const getBgByType: { [key in PokeType]: string[] } = {
  bug: ["forest"],
  dark: ["city"],
  dragon: ["space"],
  electric: ["thunderplains"],
  fairy: ["space"],
  fighting: ["city", "meadow"],
  fire: ["volcanocave", "desert"],
  flying: ["mountain", "route"],
  ghost: ["earthycave"],
  grass: ["meadow"],
  ground: ["mountain", "earthycave", "route"],
  ice: ["icecave"],
  normal: ["route", "city"],
  poison: ["earthycave"],
  psychic: ["city", "spl"],
  rock: ["mountain", "earthycave"],
  steel: ["mountain"],
  water: ["beach", "beachshore", "river", "deepsea"],
}

const PokeCard = styled(Card)`
  height: 100%;
  min-width: 450px;
  max-height: 600px;
  border-radius: 1.5em;
  box-shadow: 2px 4px 4px -2px #000;

  background-color: transparent;
  background-position: center;
  background-repeat: no-repeat;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`
const PokeContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: end;
  background: linear-gradient(to top, #000 -5%, transparent 25%);
  width: 100%;
  height: 100%;
  padding: 20px;
  gap: 2;
`

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PokeInfo({ cardRef }: Props) {
  const smashCtx = useSmash() as NonNullable<ReturnType<typeof useSmash>>
  const { currentId, pokeInfo, setCurrentId, style, score, shockRef } = smashCtx
  // const cardRef = useRef<any>(null)
  const { data } = useSWR<PokemonSpecies>(() => pokeInfo?.species.url, fetcher)

  const bgUrl =
    style && style === "showdown"
      ? pokeInfo?.sprites.versions["generation-v"]["black-white"].animated.front_default
      : pokeInfo?.sprites.other["official-artwork"].front_default || "/loading.png"

  const chosenBg =
    pokeInfo &&
    getBgByType[pokeInfo.types[0].type.name as PokeType][
      Math.floor(Math.random() * getBgByType[pokeInfo.types[0].type.name as PokeType].length)
    ]

  if (!smashCtx || !pokeInfo) {
    return (
      <div
        className="cardContainer h-full"
        style={{
          minWidth: "450px",
          maxHeight: "600px",
        }}>
        <PokeCard>
          <CircularProgress />
        </PokeCard>
      </div>
    )
  }
  return (
    <div
      className="cardContainer h-full"
      style={{
        minWidth: "450px",
        maxHeight: "600px",
      }}>
      <SwipeCards
        ref={cardRef}
        onSwipe={async (dir) => {
          if (data?.is_baby && dir === "right") shockRef.current?.shocked(cardRef)
          else {
            setTimeout(() => cardRef.current.reset(), 500)
          }
          if (dir === "left") {
            score.pass()
          } else if (dir === "right") {
            score.smash()
          }
          setCurrentId((id) => id + 1)
        }}>
        <PokeCard
          sx={{
            backgroundImage:
              "url(" +
              bgUrl +
              ")," +
              `url(/backgrounds/bg-${chosenBg || "beach"}.${chosenBg === "space" ? "jpg" : "png"})`,
            backgroundSize: "80%, cover",
            backgroundPosition: "center, left",
          }}>
          <PokeContent className="select-none">
            <Typography variant="h4" fontWeight={700} component="h1">
              {capitalizeFirstLetter(pokeInfo.name)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {pokeInfo.types.map((type, i) => (
                <Type type={type.type.name as any} key={i} />
              ))}
            </Stack>
            <Typography>
              {data?.flavor_text_entries.find((v) => v.language.name === "en")?.flavor_text || "Succelent, Beautiful."}
            </Typography>
          </PokeContent>
        </PokeCard>
      </SwipeCards>
    </div>
  )
}
