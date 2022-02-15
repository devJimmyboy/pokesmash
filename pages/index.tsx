import * as React from "react"
import type { NextPage } from "next"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Link from "../src/Link"
import PokeInfo from "../components/PokeInfo"
import SmashPass from "../components/SmashPass"
import { css, FormControlLabel, Stack, useTheme } from "@mui/material"
import { Pokemon } from "pokenode-ts"
import { useState } from "react"
import useSWR, { mutate } from "swr"
import { useLocalStorage, useSessionStorage } from "react-use"
import StyleSwitch from "../components/StyleSwitch"
import { useSmash } from "../lib/SmashContext"
import LoginButton from "../components/LoginButton"

const headerCSS = css`
  -webkit-text-stroke: 1pt #3b4cca;
  font-size: 60px;
  font-weight: bold;
  font-family: Pokemon;
  cursor: default;
  user-select: none;
`

const Home: NextPage = () => {
  const theme = useTheme()
  const { setCurrentId, currentId, pokeInfo, style } = useSmash() as NonNullable<ReturnType<typeof useSmash>>
  const cardRef = React.useRef<any>(null)

  return (
    <Box
      sx={{
        my: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}>
      <Typography
        variant="h4"
        component="h1"
        css={headerCSS}
        gutterBottom
        sx={{
          color: "#FFDE00",
          mt: 5,
        }}>
        Poké
        <Typography
          display="inline"
          css={css`
            font-size: 72px;
            margin-left: 8px;
            font-family: "Lilita One";
            font-weight: 600;
            color: ${theme.palette.error.main};
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-stroke-color: transparent;
            cursor: url(https://cdn.7tv.app/emote/609f355eb55466cf076467b1/1x), default;
            background-size: 120%;
            background-position: center;
            transition: color 0.4s ease-in-out;
            &:hover {
              color: transparent;
              background-image: url(https://cdn.7tv.app/emote/609f355eb55466cf076467b1/4x);
            }
          `}>
          SMASH
        </Typography>
      </Typography>
      {pokeInfo && <PokeInfo cardRef={cardRef} />}
      {!pokeInfo && <div>failed to load</div>}
      <Stack direction="column" sx={{ height: 400, mt: 6 }}>
        <SmashPass onChoice={(ch) => cardRef.current?.swipe(ch === "smash" ? "right" : "left")} />
      </Stack>
      <Box sx={{ position: "absolute", right: 4, top: 4 }}>
        <LoginButton />
      </Box>
    </Box>
  )
}

export default Home
