import React, { useCallback, useEffect, useRef, useState } from "react"
import ReactCanvasConfetti from "react-canvas-confetti"
import { gsap } from "gsap"
import { Promise } from "bluebird"
import { useBoolean, useRafLoop, useWindowSize } from "react-use"
import { Button, NoSsr, Portal, useTheme } from "@mui/material"
import ReactAudioPlayer from "react-audio-player"
import type { SimulatorRef } from "./Simulator/Simulator"
import dynamic from "next/dynamic"
const Simulator = dynamic(() => import("./Simulator/Simulator"), {
  ssr: false,
})

const audioSources = {
  crescendo: "/sounds/crescendo.mp3",
  kidCheer: "/sounds/kid-cheer.mp3",
}

export interface CelebrationRef {
  start: () => Promise<void>
  confetti: confetti.CreateTypes | null
}
var skew = 1
interface Props {}

const text = ["", "Hello there. \nMy name is Professor $m0ak."]

const Celebration = React.forwardRef<CelebrationRef, Props>(({}: Props, ref) => {
  const animRef = useRef<confetti.CreateTypes | null>(null)
  const audioRef = useRef<ReactAudioPlayer | null>(null)
  const simRef = useRef<SimulatorRef>(null)
  const { width, height } = useWindowSize()
  const [started, start] = useBoolean(false)
  const [source, setSource] = useState("")

  useEffect(() => {
    if (audioRef.current && audioRef.current.audioEl.current) {
      audioRef.current.audioEl.current.volume = 0.65
      console.log("Playing " + source, "volume", audioRef.current.audioEl.current.volume)
      audioRef.current.audioEl.current.src = source
      audioRef.current.audioEl.current.play()
    }
  }, [source])

  const getInstance = useCallback((instance: confetti.CreateTypes | null) => {
    animRef.current = instance
  }, [])

  const theme = useTheme()

  const [loopStop, loopStart, isActive] = useRafLoop((time) => {
    if (time < 0.5) console.log("Rendering")
    if (!animRef.current) return
    skew = Math.max(0.8, skew - 0.001)
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
    setSource(audioSources.crescendo)
    await tl.play()
    setSource(audioSources.kidCheer)
    loopStart()
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

  if (!started && process.env.NODE_ENV === "development")
    return (
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)" }}>
        <Button size="large" onClick={onStart}>
          Start Celebration Sequence
        </Button>
      </div>
    )
  if (!started) return null

  return (
    <>
      <ReactAudioPlayer ref={(audioR) => (audioRef.current = audioR)} src={source} />
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
        style={{
          position: "absolute",
          zIndex: 999,
          pointerEvents: "auto",
          width: "100vw",
          height: "100vh",
          top: 0,
          left: 0,
        }}>
        <Simulator text={text} ready={true} width={width} height={height} ref={simRef} />
      </div>
    </>
  )
})
Celebration.displayName = "Celebration"
export default Celebration

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}
