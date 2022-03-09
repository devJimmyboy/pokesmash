import React, { PropsWithChildren, PropsWithRef, useState } from "react"
import { useSpring, animated, to as interpolate, SpringValue } from "@react-spring/web"
import type { SpringRef } from "@react-spring/web"

import { useDrag } from "@use-gesture/react"
import styles from "../styles/Deck.module.css"
import { useAnimationFrame } from "framer-motion"
import { Icon } from "@iconify/react"
import { useTheme } from "@mui/system"
import { useWindowSize } from "react-use"
const RESTORE_DELAY = 350
interface Props {
  onSwipe: (direction: "left" | "right" | "up" | "down") => void
}

const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -5 + Math.random() * 10,
  delay: i * 100,
})

const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })

const trans = (r: number, s: number) => `  rotateZ(${r}deg) scale(${s})`

export interface SwipeRef {
  x: SpringValue<number>
  y: SpringValue<number>
  api: SpringRef<any>

  reset: () => Promise<void>
  swipe: (dir: "left" | "right" | "up" | "down") => Promise<void>
}
const gone: [number] = [0]
const SwipeCards = React.forwardRef<SwipeRef, PropsWithChildren<Props>>(({ children, onSwipe }, ref) => {
  const theme = useTheme()
  const [word, setWord] = useState("PASS")
  const { width: windowWidth, height: windowHeight } = useWindowSize()

  const [props, api] = useSpring(() => ({
    ...to(0),
    from: from(0),
  })) // Create a bunch of springs using the helpers above
  const bind = useDrag(
    ({ active, elapsedTime, values: [px, py], movement: [mx, my], direction: [xDir, yDir], velocity: [vx, vy] }) => {
      const trigger = vx > 0.25 // If you flick hard enough it should trigger the card to fly out
      //const dir = mx === 0 ? 0 : mx / Math.abs(mx) // Direction should either be -1 (left), 1 (right), or 0 (none)
      if (word === "PASS" && px > windowWidth / 2) {
        setWord("SMASH")
      } else if (word === "SMASH" && px < windowWidth / 2) {
        setWord("PASS")
      }
      if (!active && trigger) {
        gone[0] = xDir
        console.log("gone")
      } // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
      api.start(() => {
        const x = gone[0] ? (200 + windowWidth) * xDir : active ? mx : 0 // When a card is gone it flys out left or right, otherwise goes back to zero
        const rot = mx / 100 + (gone ? xDir * 10 * vx : 0) // How much the card tilts, flicking it harder makes it rotate faster
        const scale = active ? 1.1 : 1 // Active cards lift up a bit
        return {
          x,
          rot,
          scale,
          // delay: undefined,
          config: { friction: 50, tension: active ? 800 : gone[0] ? 200 : 500 },
        }
      })
      if (!active && gone[0]) {
        onSwipe(xDir > 0 ? "right" : "left")
      }
    }
  )
  const { x, y, scale, rot } = props

  const opacity = x.to((val) => Math.min(normalize(Math.abs(val), windowWidth / 3, 0), 0.9))

  // useAnimationFrame((t) => {
  //   if (Math.abs(x.get()) > windowWidth / 3) {
  //     // console.log("offscreen")
  //   }
  // })

  React.useImperativeHandle(
    ref,
    () => ({
      api,
      x,
      y,
      async reset() {
        gone[0] = 0
        api.start(() => to(0))
      },
      async swipe(direction: "left" | "right" | "up" | "down") {
        const yDir = direction === "up" ? -1 : direction === "down" ? 1 : 0,
          xDir = direction === "left" ? -1 : direction === "right" ? 1 : 0
        api.start(() => ({
          x: windowWidth * xDir,
          y: windowHeight * yDir,
          rot: 45 * xDir,
          scale: 1.1,
          delay: undefined,
          config: { friction: 50, tension: 200 },
        }))
        gone[0] = xDir
        onSwipe(direction)
      },
    }),
    [api, onSwipe, gone, x, y, windowWidth]
  )

  return (
    <div className={`flex w-full h-full relative`}>
      <animated.div className={styles.deck} style={{ x, y }}>
        <animated.div
          {...bind()}
          style={{
            width: "100%",
            transform: interpolate([rot, scale], trans),
          }}>
          <animated.div className="absolute w-full h-full z-10 select-none" style={{ opacity }}>
            <div
              className="border-current border-8 border-solid rounded-lg px-2 py-0"
              style={{
                fontSize: 48,
                fontFamily: "Lilita One",
                backgroundColor: "",
                fontWeight: 700,
                position: "absolute",
                top: "30%",
                left: word === "PASS" ? "75%" : "25%",
                color: word === "PASS" ? theme.palette.pass.main : theme.palette.smash.main,
                transform: `translate(-50%,-50%) rotate(${word === "PASS" ? 15 : -15}deg)`,
              }}>
              {word}
            </div>
          </animated.div>
          {children}
        </animated.div>
      </animated.div>
    </div>
  )
})
SwipeCards.displayName = "SwipeCards"

export default SwipeCards

function normalize(val: number, max: number, min: number) {
  return (val - min) / (max - min)
}
