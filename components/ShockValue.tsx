import { motion, useAnimation } from "framer-motion"
import Image from "next/image"
import React, { RefObject, useEffect, useState } from "react"
import { SwipeRef } from "./SwipeCards"
export type ShockRef = {
  shocked: (cardRef?: RefObject<SwipeRef>) => void
}
type Props = {}

const ShockValue = React.forwardRef<ShockRef, Props>(({}, ref) => {
  const [src, setSource] = useState("/sounds/thud.opus")
  const audio = React.useRef<HTMLAudioElement>(null)
  const api = useAnimation()
  useEffect(() => {
    if (audio.current) {
      audio.current.volume = 0.4
    }
  }, [audio])
  React.useImperativeHandle(ref, () => ({
    shocked: async (cardRef) => {
      if (audio.current) {
        if (audio.current.paused) audio.current.play()
        else audio.current.currentTime = 0
      }
      await api.start({
        opacity: 1,
        scale: 1.25,
        transition: { duration: 0.4, ease: "easeIn" },
      })
      await api.start({
        scale: 2,
        transition: { duration: 1, ease: "linear" },
      })
      await api.start({
        scale: 10,
        opacity: 0,
        transition: { duration: 0.2, ease: "easeOut" },
        transitionEnd: { scale: 0.75 },
      })
      if (cardRef && cardRef.current) {
        cardRef.current.reset()
      }
    },
  }))
  return (
    <>
      <div className="fixed w-screen h-screen pointer-events-none">
        <audio preload="/sounds/thud.opus" ref={audio} src={src} />
        <motion.div
          style={{
            position: "absolute",
            translateX: "-50%",
            translateY: "-50%",
            transformOrigin: "0.5 0.5",
            top: "50%",
            left: "50%",
            opacity: 0,
            scale: 0.75,
          }}
          animate={api}>
          <Image width={128} height={128} src="/img/HUH.png" alt="HUH" />
        </motion.div>
      </div>
    </>
  )
})
ShockValue.displayName = "ShockValue"

export default ShockValue
