import * as React from "react"
import type { NextPage } from "next"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Link from "../src/Link"
import PokeInfo from "../components/PokeInfo"
import SmashPass from "../components/SmashPass"
import { css, FormControlLabel, IconButton, Stack, Tooltip, useTheme } from "@mui/material"
import { Pokemon } from "pokenode-ts"
import { useState } from "react"
import useSWR, { mutate } from "swr"
import { useLocalStorage, useSessionStorage } from "react-use"
import StyleSwitch from "../components/StyleSwitch"
import { useSmash } from "../lib/SmashContext"
import LoginButton from "../components/LoginButton"
import { styled } from "@mui/material/styles"
import UserStats from "../components/UserStats"
import { Icon } from "@iconify/react"
import { SwipeRef } from "../components/SwipeCards"

const headerCSS = css`
  -webkit-text-stroke: 1pt #3b4cca;
  font-size: 5vh;

  font-weight: bold;
  font-family: Pokemon;
  cursor: default;
  user-select: none;
`

const Home: NextPage = () => {
  const theme = useTheme()
  const { error, setCurrentId, currentId, pokeInfo, style, score, shockRef } = useSmash() as NonNullable<
    ReturnType<typeof useSmash>
  >
  const cardRef = React.useRef<SwipeRef>(null)

  return (
    <Box
      sx={{
        my: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
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
            font-size: 6vh;
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
      <PokeInfo cardRef={cardRef} />

      {error && <div>Error! {error.message || "Please Reload"}</div>}
      <Stack direction="column" sx={{ height: 400, mt: { sm: 2, md: 4, xl: 6 } }} spacing={4}>
        <Typography fontSize={{ sm: 24, lg: 32 }} fontWeight="bold" align="center">
          Pokemon {currentId} of 898
        </Typography>
        <SmashPass
          smashes={score.smashes}
          passes={score.passes}
          onChoice={(ch) => {
            cardRef.current?.swipe(ch === "smash" ? "right" : "left")
          }}
        />

        <UserStats />
      </Stack>
      <Box sx={{ position: "absolute", right: 4, top: 4 }}>
        <LoginButton />
      </Box>
      <Footer>
        <CreatedCard className="h-8 md:h-auto" sx={{ fontSize: [16, 18, 24, 28] }}>
          <div className="hidden md:inline">Created by </div>
          <Link
            href="https://jimmyboy.tv"
            target="_blank"
            sx={(theme) => ({
              fontFamily: "Lilita One",
              textDecoration: "none",
              color: theme.palette.twitch.muted.widow,
              fontWeight: 400,
              textShadow: "2px 2px 1px #000",
              transition: "text-shadow 200ms ease-in-out",
              "div:hover > &": {
                textShadow: "4px 4px 2px #000",
              },
            })}>
            Jimmyboy
          </Link>
        </CreatedCard>
        <div className="flex-grow" />
        <Tooltip
          className="pointer-events-auto p-0 m-0 mr-12"
          title="Support me for more content like this!"
          placement="left-start">
          <IconButton className="w-10 h-10 p-0 m-0" target="_blank" href="https://www.patreon.com/devJimmyboy">
            <Icon fontSize={18} icon="fa-brands:patreon" />
          </IconButton>
        </Tooltip>
      </Footer>
    </Box>
  )
}

export default Home

const Footer = styled("footer")`
  @media screen and (min-width: 800px) {
    bottom: 0;
    top: unset;
    width: 100%;
    gap: unset;
  }
  left: 0;
  top: 0;
  gap: 0.25em;
  position: fixed;
  pointer-events: none;
  display: flex;
  flex-direction: row;
`

const CreatedCard = styled("div")`
  @media screen and (min-width: 800px) {
    border-radius: 0.45em 0.45em 0 0;
    padding: 0.325em 0.825em;
    font-weight: bold;
  }
  background: ${(props) => props.theme.palette.twitch.main};
  pointer-events: auto;
  user-select: none;
  font-size: 18px;
  padding: 0.125em 0.5em;

  border-radius: 0 0 0.45em 0.45em;

  margin-left: 1em;
  font-weight: 600;
`
