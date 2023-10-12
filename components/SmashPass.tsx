import { Button, ButtonProps } from '@mui/base'
import { Button as MuiButton, Stack, useTheme } from '@mui/material'
import { styled } from '@mui/material/styles'
import { motion, useAnimation, Variants } from 'framer-motion'
import React, { useCallback, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useSmash } from '../lib/SmashContext'

const MotionButton = motion(MuiButton)
const ChoiceButtonRoot = styled(MotionButton)`
  --bColor: ${({ theme }) => theme.palette.primary.main};
  display: flex;
  gap: 0.25em;
  @media screen and (min-width: 800px) {
    gap: 6px;
    width: 250px;
    height: 100px;
    font-size: 2em;
  }
  width: 45%;
  height: calc(1.5em + 5vh);

  padding-top: 0.25rem;
  padding-bottom: 0.25rem;

  border-radius: 1.25rem;
  border: 4px solid var(--bColor);
  font-size: 1.75em;

  font-weight: bold;
  color: var(--bColor);
  transition: color 250ms linear;
  background-color: transparent;

  &:hover,
  &.selected {
    &.pass {
      --bColor: ${({ theme }) => theme.palette.pass.main};
    }
    &.smash {
      --bColor: ${({ theme }) => theme.palette.smash.main};
    }
    border: 6px solid;
    &.selected {
    }
  }
`

const MButtonUnstyled = motion(Button)

const Kbd = styled('kbd')`
  background-color: transparent;
  border-radius: 3px;
  border: 2px solid ${(props) => props.theme.palette.primary.main};
  color: #fcf;
  font-size: 0.85em;
  font-weight: 700;
  line-height: 1;
  padding: 0.15em 0.3em;
  white-space: nowrap;
  margin: 0 0.4em;
`

export const ScoreDisplay = styled('div')`
  /* font-size: 1em; */
  display: flex;
  padding: 0.75em;
  gap: 2px;
  color: ${(props) => props.theme.palette.text.primary};
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media screen and (min-width: 800px) {
    border-radius: 0.825rem;
  }
  font-weight: normal;
  font-family: 'Lilita One', 'Segoe UI', sans-serif;
  border-radius: 0.5rem;
  vertical-align: bottom;
  width: 25px;
  height: 25px;
  &.passes {
    background-color: ${(props) => props.theme.palette.pass.main}ac;
    right: 5%;
  }
  &.smashes {
    background-color: ${(props) => props.theme.palette.smash.main}ac;
    left: 5%;
  }
`

interface Props {
  smashes: number
  passes: number
  onChoice: (choice: 'smash' | 'pass' | undefined) => void
}

export default function SmashPass({ onChoice, smashes, passes }: Props) {
  return (
    <Stack direction="row" justifyContent="center" spacing={{ md: 6 }} className="w-screen max-w-lg gap-2" sx={{ mt: { sm: '0.5em', xl: '2em' } }}>
      <ChoiceButton choiceType="pass" onChoice={onChoice}>
        <span className="flex-grow">Pass</span>
        <ScoreDisplay className="passes md:mr-4">{passes}</ScoreDisplay>
      </ChoiceButton>
      {/* <div className="flex-grow" /> */}
      <ChoiceButton choiceType="smash" onChoice={onChoice}>
        <ScoreDisplay className="smashes md:ml-4">{smashes}</ScoreDisplay>
        <span className="flex-grow">Smash</span>
      </ChoiceButton>
    </Stack>
  )
}

interface ChoiceButtonProps extends ButtonProps {
  choiceType: 'smash' | 'pass'
  onChoice: (type?: 'smash' | 'pass') => void
}

function ChoiceButton({ choiceType, onChoice, ...props }: ChoiceButtonProps) {
  const api = useAnimation()
  const theme = useTheme()
  const variants: Variants = {
    selected: {
      scale: 1.1,
    },
    prevSelected: {
      borderWidth: '6px',
      // @ts-ignore
      '--bColor': theme.palette[choiceType].main,
    },
    idle: {
      scale: 1,
      // @ts-ignore
      '--bColor': theme.palette.primary.main,
    },
  }

  const { score, currentId } = useSmash()

  useEffect(() => {
    const anims: string[] = []
    if (score.choices[currentId] === choiceType) anims.push('prevSelected')
    const tm = setTimeout(() => api.start(['idle', ...anims], { duration: 0.15 }), 150)
    return () => clearTimeout(tm)
  }, [currentId, score, api])
  const onClick = useCallback(() => {
    const anims: string[] = []
    if (score.choices[currentId] === choiceType) anims.push('prevSelected')

    api.start([...anims, 'selected'], { duration: 0.15 })

    onChoice(choiceType)
  }, [api, currentId, onChoice, score])
  useHotkeys(choiceType === 'pass' ? 'left' : 'right', onClick, [onClick])
  return (
    // @ts-ignore
    <MButtonUnstyled
      {...props}
      className={`${choiceType}`}
      onClick={onClick}
      variants={variants}
      animate={api}
      slots={{
        root: ChoiceButtonRoot,
      }}
      whileHover="selected"
      whileTap={{ scale: 0.95 }}
    />
  )
}
