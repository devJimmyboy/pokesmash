import { InputUnstyled } from '@mui/core'
import { styled } from '@mui/material'
import React, { useEffect, useState } from 'react'

import { useSmash } from '../lib/SmashContext'

interface Props {}

export default function IdField({}: Props) {
  const { currentId, setCurrentId, score } = useSmash()

  const updateId = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget.value && e.currentTarget.value.length > 0) {
        let nId = currentId
        try {
          nId = parseInt(e.currentTarget.value)
        } catch (e) {
          nId = currentId
        }
        // if (nId >= score.currentId) setCurrentId(score.currentId)
        // else
        if (nId > 0) setCurrentId(() => nId)
        else e.currentTarget.textContent = currentId.toString()
      }
    },
    [currentId, setCurrentId, score]
  )

  return (
    <InputEditable
      value={currentId || 1}
      type="number"
      onChange={updateId}
      onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => {
        e.stopPropagation()
      }}
      componentsProps={{
        input: {
          'data-form-type': 'other',
        } as any,
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

  & .MuiInput-input {
    border: 0;
    height: 100%;
    outline: none;
    width: fit-content;
    max-width: 6.5ch;
    border-radius: 0.625rem;
    background: ${(props) => props.theme.palette.background.paper};
    &:focus-visible {
      outline-color: ${(props) => props.theme.palette.primary.main};
      outline-width: 2px;
      outline-style: auto;
    }
    font-weight: 700;
    font-size: 1.5rem;
    font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
    text-align: center;
  }
  & .MuiInput-root {
    width: min-content;
  }
`
