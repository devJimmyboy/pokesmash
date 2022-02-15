import React, { PropsWithChildren, PropsWithRef, useState } from "react"
import { useSpring, animated, to as interpolate } from "@react-spring/web"
import { useDrag } from "@use-gesture/react"
import styles from "../styles/Deck.module.css"
import { useBoolean } from "react-use"

interface Props {
  onSwipe: (direction: "left" | "right" | "up" | "down") => void
}

const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
})

const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })

const trans = (r: number, s: number) => `  rotateZ(${r}deg) scale(${s})`

interface SwipeRef {
  reset: () => Promise<void>
  swipe: (dir: "left" | "right" | "up" | "down") => Promise<void>
}

const SwipeCards = React.forwardRef<SwipeRef, PropsWithChildren<Props>>(({ children, onSwipe }, ref) => {
  const [gone] = useState<[number]>([0]) // The set flags all the cards that are flicked out
  const [props, api] = useSpring(() => ({
    ...to(0),
    from: from(0),
  })) // Create a bunch of springs using the helpers above
  const bind = useDrag(
    ({ active, elapsedTime, xy: [px, py], movement: [mx, my], direction: [xDir, yDir], velocity: [vx, vy] }) => {
      const trigger = vx > 0.2 // If you flick hard enough it should trigger the card to fly out
      const dir = mx === 0 ? 0 : mx / Math.abs(mx) // Direction should either be -1 (left), 1 (right), or 0 (none)
      if (!active && trigger) {
        gone[0] = xDir !== 0 ? xDir : dir
        console.log("gone")
      } // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
      api.start(() => {
        const x = gone[0] ? (200 + window.innerWidth) * (xDir === 0 ? dir : xDir) : active ? mx : 0 // When a card is gone it flys out left or right, otherwise goes back to zero
        const rot = mx / 100 + (gone ? xDir * 10 * vx : 0) // How much the card tilts, flicking it harder makes it rotate faster
        const scale = active ? 1.1 : 1 // Active cards lift up a bit
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: active ? 800 : gone[0] ? 200 : 500 },
        }
      })
      if (!active && gone[0]) {
        onSwipe(xDir > 0 ? "left" : "right")
        setTimeout(() => {
          gone[0] = 0
          console.log("back")
          api.start(() => to(0))
        }, 900)
      }
    }
  )
  const { x, y, scale, rot } = props

  React.useImperativeHandle(
    ref,
    () => ({
      async reset() {
        gone[0] = 0
        api.start(() => to(0))
      },
      async swipe(direction: "left" | "right" | "up" | "down") {
        const yDir = direction === "up" ? -1 : direction === "down" ? 1 : 0,
          xDir = direction === "left" ? -1 : direction === "right" ? 1 : 0
        api.start(() => ({
          x: window.innerWidth * xDir,
          y: window.innerHeight * yDir,
          rot: 45 * xDir,
          scale: 1.1,
          delay: undefined,
          config: { friction: 50, tension: 200 },
        }))
        gone[0] = xDir
        onSwipe(direction)
        setTimeout(() => {
          gone[0] = 0 // Reset the gone flag
          api.start(() => to(0))
        }, 900)
      },
    }),
    [api, onSwipe, gone]
  )

  return (
    <div className={`flex w-full h-full relative ${styles.container}`}>
      <animated.div className={styles.deck} style={{ x, y }}>
        <animated.div
          {...bind()}
          style={{
            transform: interpolate([rot, scale], trans),
          }}>
          {children}
        </animated.div>
      </animated.div>
    </div>
  )
})
SwipeCards.displayName = "SwipeCards"

export default SwipeCards
