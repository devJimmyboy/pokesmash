import React, { useCallback, useEffect, useRef, useState } from "react"
import ReactCanvasConfetti from "react-canvas-confetti"
import { gsap } from "gsap"
import { Promise } from "bluebird"
import { useBoolean, useList, useMount, useRaf, useRafLoop, useWindowSize } from "react-use"
import { Box, Button, IconButton, NoSsr, Portal, Typography, useTheme } from "@mui/material"
import { Howl, Howler } from "howler"
import { motion, useAnimation } from "framer-motion"
import { Icon } from "@iconify/react"
import { useSmash } from "../lib/SmashContext"
import { createFirebaseApp } from "../firebase/clientApp"
import { get, getDatabase, ref } from "firebase/database"
import { useSession } from "next-auth/react"
import { capitalizeFirstLetter, usePokemonPicture } from "../lib/utils"
import { FixedSizeList as List, FixedSizeListProps, ListChildComponentProps } from "react-window"

import useSWR from "swr"
// import type { SimulatorRef } from "./Simulator/Simulator"
// import dynamic from "next/dynamic"
// const Simulator = dynamic(() => import("./Simulator/Simulator"), {
//   ssr: false,
// })

var howler = Howler as unknown as HowlerGlobal
howler.autoUnlock = false

howler.volume(0.5)
const sounds: { [key: string]: Howl } = {
  crescendo: new Howl({
    src: ["/sounds/crescendo.mp3"],
    sprite: {
      sound: [0, 6850],
    },
  }),
  confettiPop: new Howl({ src: ["/sounds/pop.mp3"] }),
  kidCheer: new Howl({ src: ["/sounds/kid-cheer.mp3"] }),
  music: new Howl({ src: ["/sounds/music/rhubarb-pie.mp3"], loop: true, volume: 0.15 }),
}

export interface CelebrationRef {
  start: () => Promise<void>
  confetti: confetti.CreateTypes | null
}
var skew = 1

const ids = {
  root: "#rootText",
  text: "#celebrateText",
  scoreText: "#scoreText",
}

interface Props {}

const text = ["", "Hello there. \nMy name is Professor $m0ak."]
const Celebration = React.forwardRef<CelebrationRef, Props>(({}: Props, ref) => {
  const { score } = useSmash()
  const animRef = useRef<confetti.CreateTypes | null>(null)
  const listRef = useRef<number>(null)

  const [tlTxt, setTlTxt] = useState<GSAPTimeline>(gsap.timeline({ paused: true }))
  // const simRef = useRef<SimulatorRef>(null)
  // const { width, height } = useWindowSize()
  const [started, start] = useBoolean(false)

  useEffect(() => {
    if (!started) return
    gsap.set(ids.scoreText, { autoAlpha: 0 })
    gsap.set(ids.root, { autoAlpha: 0, scale: 0.01 })
  }, [started])

  useEffect(() => {
    if (!started) return
    const totalScore = score.passes + score.smashes

    tlTxt
      .to(ids.root, { autoAlpha: 1, duration: 0.5, scale: 1, ease: "bounce" }, 0)
      .to(ids.text, { duration: 1, y: -window.innerHeight / 3, ease: "bounce", delay: 5 })
      .to(ids.scoreText, { duration: 0.25, autoAlpha: 1, ease: "bounce" })
      .fromTo(
        "#scroller",
        { top: "100%" },
        {
          duration: 0.6 * totalScore,
          top: "unset",
          bottom: "100%",
          ease: "linear",
        },
        "+=0.5"
      )
      .to(
        ids.root,
        {
          duration: 4,
          autoAlpha: 0,
          ease: "easeInOut",
          onStart() {
            sounds.music.fade(0.15, 0, 4000)
          },
        },
        "+=1"
      )
      .to("#appControl", { autoAlpha: 1, duration: 0.5, ease: "easeInOut" }, "+=0.5")
      .call(() => start(false))
    sounds.confettiPop.once("play", (s) => {})
  }, [started, listRef.current])

  const getInstance = useCallback((instance: confetti.CreateTypes | null) => {
    animRef.current = instance
  }, [])

  const theme = useTheme()

  const [loopStop, loopStart, isActive] = useRafLoop((time) => {
    if (time < 500) console.log("Rendering")
    if (!animRef.current) {
      console.log("No animation")

      return
    }
    if (skew > 0) skew = Math.max(0.8, skew - 0.001)
    animRef.current({
      particleCount: 1,
      startVelocity: randomInRange(0, -10),
      ticks: 450,
      origin: {
        x: Math.random(),
        // since particles fall down, skew start toward the top
        y: Math.random() * skew - 0.5,
      },
      colors: [
        [theme.palette.twitch.main, theme.palette.primary.main, theme.palette.smash.main, theme.palette.pass.main][
          Math.floor(Math.random() * 4)
        ],
      ],
      shapes: ["square"],
      gravity: randomInRange(0.4, 0.6),
      scalar: randomInRange(0.4, 1),
      drift: randomInRange(-0.4, 0.4),
    })
  }, false)

  const onStart = useCallback(async () => {
    let tl = gsap.timeline()
    tl.to("#appControl", { autoAlpha: 0, duration: 0.2 })
    tl.to("body", { backgroundColor: "#101010", duration: 7.0 }, 0)

    start(true)
    sounds.crescendo.play("sound")
    await tl.play()
    if (animRef.current) {
      sounds.confettiPop.play()
      if (tlTxt) tlTxt.play()
      animRef.current({ angle: -90, particleCount: 100, origin: { x: 0.5, y: -0.1 }, spread: 45 })
    }
    sounds.kidCheer.play()
    loopStart()

    sounds.music.play()
  }, [start, loopStart, isActive])

  React.useImperativeHandle(
    ref,
    () => ({
      start: onStart,
      stop: () => {
        start(false)
      },
      confetti: animRef.current,
    }),
    [animRef, start]
  )
  const [muted, setMuted] = useBoolean(false)
  useEffect(() => {
    sounds.music.mute(muted)
  }, [muted])

  if (!started) return null

  return (
    <>
      <ReactCanvasConfetti
        style={{
          position: "fixed",
          pointerEvents: "none",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }}
        refConfetti={getInstance}
      />
      <div
        className="flex flex-col items-center justify-center"
        style={{
          position: "absolute",
          zIndex: 999,
          pointerEvents: "auto",
          width: "100vw",
          height: "100vh",
          top: 0,
          left: 0,
        }}>
        <IconButton
          className="fixed top-4 left-4 w-10 h-10"
          sx={{
            backgroundColor: muted ? theme.palette.pass.main : theme.palette.smash.main,
            "&:hover": {
              backgroundColor: muted ? theme.palette.pass.main : theme.palette.smash.main,
              backgroundOpacity: 0.8,
            },
          }}
          onClick={() => setMuted()}>
          <Icon fontSize={24} icon={muted ? "fa-solid:volume-mute" : "fa-solid:volume"} />
        </IconButton>

        <div id="rootText" className="flex flex-col w-full h-full  items-center justify-center top-0 left-0">
          <div id="scoreText" className="absolute w-full h-full">
            <div className="relative w-full h-full flex flex-col items-center overflow-hidden">
              <ScoresList ref={listRef} />
            </div>
          </div>
          <Typography id="celebrateText" variant="h1" style={{ fontSize: "10vw" }}>
            Congratulations!
          </Typography>
        </div>
      </div>
    </>
  )
})
Celebration.displayName = "Celebration"
export default Celebration

// const MotionText = motion(Typography)

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}
const app = createFirebaseApp()
const db = getDatabase(app)

const ScoresList = React.forwardRef<number, {}>((props, listRef) => {
  const { score } = useSmash()
  const { data: session } = useSession()
  const [scores, setScores] = useState<("pass" | "smash")[]>([])
  useEffect(() => {
    if (!session) {
      if (listRef && typeof listRef === "object") listRef.current = score.currentId
      return
    }

    const uid = session.user.name.toLowerCase()

    let choices: ("pass" | "smash")[] = []
    const userRef = ref(db, `users/${uid}`)
    get(userRef).then((userData) => {
      const passes = userData.child("passes").val()
      const smashes = userData.child("smashes").val()
      Object.keys(passes).forEach((key) => {
        choices[Number(key)] = "pass"
      })
      Object.keys(smashes).forEach((key) => {
        choices[Number(key)] = "smash"
      })
      if (choices.length < 898) {
        console.log("??? Couldn't retrieve all scores.")
      }
      setScores(choices)
      if (listRef && typeof listRef === "object") listRef.current = choices.length
    })
  }, [session])
  const { height, width } = useWindowSize()
  if (!session) {
    return (
      <div className="w-full h-full flex flex-row items-center justify-center">
        <Box
          className="text-xl lg:text-2xl"
          sx={(theme) => ({
            color: theme.palette.pass.main,
          })}>
          <Typography variant="h1" style={{ fontSize: "10vw" }}>
            Final Passes: {score.passes}
          </Typography>
        </Box>
        <Box
          className="text-xl lg:text-2xl"
          sx={(theme) => ({
            color: theme.palette.smash.main,
          })}>
          <Typography variant="h1" style={{ fontSize: "10vw" }}>
            Final Smashes: {score.smashes}
          </Typography>
        </Box>
      </div>
    )
  }
  return (
    <div id="scroller" style={{ width: width / 2, height: scores.length * 76, position: "absolute" }}>
      {scores.map((score, i) => (
        <ScoreView key={`score-${i}`} index={i} data={scores} style={{ height: 76 }} />
      ))}
    </div>
  )
})
ScoresList.displayName = "ScoresList"

interface ScoreViewProps extends ListChildComponentProps<("pass" | "smash")[]> {}
const fetcher = (url: string) => fetch(url).then((res) => res.json())
function ScoreView({ data, index: pokemon, style }: ScoreViewProps) {
  const { bgUrl, shiny } = usePokemonPicture(pokemon)
  const { data: pokeInfo } = useSWR(`/api/pokemon/?id=${pokemon}`, fetcher)
  const choice = data[pokemon]
  const scoreRef = useRef<HTMLDivElement>(null)

  return (
    <div
      style={{ ...style }}
      ref={scoreRef}
      className="score-view flex flex-row items-center h-16 w-full justify-between py-2">
      <div style={{ height: "100%" }}>
        <img style={{ height: "100%" }} src={bgUrl} />
      </div>
      <div className="text-2xl text-white font-semibold">{pokeInfo && capitalizeFirstLetter(pokeInfo.name)}</div>
      <Typography
        sx={(theme) => ({
          color: choice === "pass" ? theme.palette.pass.main : theme.palette.smash.main,
        })}
        fontSize={24}
        fontWeight={700}>
        {choice === "pass" ? "Pass" : "Smash"}
      </Typography>
    </div>
  )
}
