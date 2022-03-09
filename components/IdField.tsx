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
  border: none;
  border-radius: 0.625rem;
  overflow: hidden;
  background: transparent;
  border: 0;
  font-size: 1.5rem;
  height: 100%;

  & .${inputUnstyledClasses.input} {
    border: 0;
    height: 100%;
    outline: none;
    max-width: 4ch;
    border-radius: 0.625rem;
    background: ${(props) => props.theme.palette.background.paper};
    &:focus-visible {
      outline-color: ${(props) => props.theme.palette.primary.main};
      outline-width: 2px;
      outline-style: auto;
    }
    font-weight: 700;
    font-size: 1.5rem;
    font-family: "Segoe UI", "Helvetica Neue", sans-serif;
    text-align: center;
  }
  & .${inputUnstyledClasses.root} {
    width: min-content;
  }
`
