import React from "react";
import { animated, useSpring } from "react-spring";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  in: boolean
  onEnter?: () => void
  onExited?: () => void
}
const Fade = React.forwardRef<HTMLDivElement, Props>(function Fade(props, ref) {
  const { in: open, children, onEnter, onExited, ...other } = props
  const style = useSpring({
    from: { opacity: 0 },
    to: { opacity: open ? 1 : 0 },
    onStart: () => {
      if (open && onEnter) {
        onEnter()
      }
    },
    onRest: () => {
      if (!open && onExited) {
        onExited()
      }
    },
  })

  return (
    <animated.div ref={ref} style={style} {...other}>
      {children}
    </animated.div>
  )
})
export default Fade
