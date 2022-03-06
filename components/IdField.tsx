import { InputUnstyled, inputUnstyledClasses } from "@mui/base"
import { styled } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useSmash } from "../lib/SmashContext"

interface Props {}

export default function IdField({}: Props) {
  const { currentId, setCurrentId, score } = useSmash()
  const [unlockedState, setUnlockedState] = useState(0)

  const updateId = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget.value && e.currentTarget.value.length > 0) {
        if (unlockedState < 5) {
          let input = e.currentTarget.value.replace(currentId.toString(), "")
          if (input.match(/[penis]/i)) {
            console.log("noticed trying to enter password 😏", "current unlock state:", unlockedState)

            if (unlockedState === 0 && input.includes("p")) setUnlockedState(1)
            if (unlockedState === 1 && input.includes("e")) setUnlockedState(2)
            if (unlockedState === 2 && input.includes("n")) setUnlockedState(3)
            if (unlockedState === 3 && input.includes("i")) setUnlockedState(4)
            if (unlockedState === 4 && input.includes("s")) {
              console.log("unlocked")
              setUnlockedState(5)
            }
          }
        } else {
          try {
            const nId = parseInt(e.currentTarget.value)

            setCurrentId(nId)
          } catch (e) {
            console.error("Invalid ID")
          }
          return
        }

        let nId = currentId
        try {
          nId = parseInt(e.currentTarget.value)
        } catch (e) {
          nId = currentId
        }
        if (nId >= score.currentId) setCurrentId(score.currentId)
        else if (nId > 0 || unlockedState === 5) setCurrentId(() => nId)
        else e.currentTarget.textContent = currentId.toString()
      }
    },
    [currentId, setCurrentId, score]
  )

  return (
    <InputEditable
      value={currentId}
      type="other"
      onChange={updateId}
      onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => {
        e.stopPropagation()
      }}>
      IdField
    </InputEditable>
  )
}
const InputEditable = styled(InputUnstyled)`
  display: inline;
  border-radius: 12px;
  overflow: hidden;
  background: transparent;
  border: 0;

  & .${inputUnstyledClasses.input} {
    outline: none;
    max-width: 4ch;
    border-radius: 12px;
    background: ${(props) => props.theme.palette.background.paper};
    &:focus-visible {
      outline-color: ${(props) => props.theme.palette.primary.main};
      outline-width: 2px;
      outline-style: auto;
    }

    text-align: center;
  }
  & .${inputUnstyledClasses.root} {
    width: min-content;
  }
`
