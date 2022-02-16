import React, { useState } from "react"
export type ShockRef = {
  shocked: () => void
}
type Props = {}

const ShockValue = React.forwardRef<ShockRef, Props>(({}, ref) => {
  const [src, setSource] = useState("/sounds/thud.opus")
  const audio = React.useRef<HTMLAudioElement>(null)
  React.useImperativeHandle(ref, () => ({
    shocked: () => {
      if (audio.current) audio.current.play()
    },
  }))
  return <audio preload="/sounds/thud.opus" ref={audio} src={src} />
})
ShockValue.displayName = "ShockValue"

export default ShockValue
