import { Card, CardContent, CardHeader, CircularProgress, Stack, Typography } from "@mui/material"
import { styled, css } from "@mui/system"
import { useRef } from "react"
import TinderCard from "react-tinder-card"
import { useSmash } from "../lib/SmashContext"

import { capitalizeFirstLetter } from "../lib/utils"
import Type from "./Type"

type Props = {}

const PokeCard = styled(Card)`
  height: 100%;
  min-width: 450px;
  max-height: 600px;
  margin-block: 1em;
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
export default function PokeInfo({}: Props) {
  const smashCtx = useSmash() as NonNullable<ReturnType<typeof useSmash>>
  const { currentId, pokeInfo, setCurrentId, style } = smashCtx
  const cardRef = useRef<any>(null)

  const bgUrl =
    style && style === "showdown"
      ? pokeInfo?.sprites.versions["generation-v"]["black-white"].animated.front_default
      : pokeInfo?.sprites.other["official-artwork"].front_default || "/loading.png"

  if (!smashCtx || !pokeInfo) {
    return (
      <PokeCard>
        <CircularProgress />
      </PokeCard>
    )
  }
  return (
    <div
      className="cardContainer h-full"
      style={{
        minWidth: "450px",
        maxHeight: "600px",
      }}>
      <TinderCard
        ref={cardRef}
        css={css`
          height: 100%;
        `}
        onCardLeftScreen={() => {
          setCurrentId(currentId + 1)
          console.log("currentId", currentId)
          if (cardRef.current) cardRef.current.restoreCard()
        }}
        preventSwipe={["down"]}>
        <PokeCard
          sx={{
            backgroundImage: "url(" + bgUrl + ")," + `url(/backgrounds/bg-beach.png)`,
            backgroundSize: "80%, cover",
            backgroundPosition: "center, left",
          }}>
          <PokeContent>
            <Typography variant="h4" fontWeight={700} component="h1">
              {capitalizeFirstLetter(pokeInfo.name)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {pokeInfo.types.map((type, i) => (
                <Type type={type.type.name as any} key={i} />
              ))}
            </Stack>
            <Typography>Succulent. Beautiful.</Typography>
          </PokeContent>
        </PokeCard>
      </TinderCard>
    </div>
  )
}
