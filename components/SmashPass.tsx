import { Icon } from "@iconify/react"
import { ButtonUnstyled, buttonUnstyledClasses, ButtonUnstyledProps } from "@mui/base"
import { Button, Stack, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { motion } from "framer-motion"
import React from "react"
import { useKey } from "react-use"

const MotionButton = motion(Button)
const ChoiceButtonRoot = styled(MotionButton)`
  --bColor: #d2d2d2;
  width: 250px;
  height: 100px;
  border-radius: 20px;
  border: 4px solid var(--bColor);
  font-size: 2em;
  font-weight: bold;
  color: var(--bColor);
  transition: color 250ms linear;

  &:hover {
    --bColor: #b026ff;
    border: 6px solid;
    background-color: transparent;
  }
`

const Kbd = styled("kbd")`
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

const ScoreDisplay = styled("div")`
  font-size: 56px;
  display: flex;
  padding: 0.1em;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-family: "Lilita One", "Segoe UI", sans-serif;
  border-radius: 15px;
  vertical-align: bottom;
  width: 100px;
  height: 100px;
  &.passes {
    background-color: #00995a;
  }
  &.smashes {
    background: radial-gradient(red, orange);
  }
`

interface Props {
  smashes: number
  passes: number
  onChoice: (choice: "smash" | "pass" | undefined) => void
}

export default function SmashPass({ onChoice, smashes, passes }: Props) {
  return (
    <Stack direction="row" justifyContent="space-around" spacing={6} className="w-full" sx={{ mt: "2em" }}>
      <ScoreDisplay className="passes">
        <Typography>Passes:</Typography>
        <span>{passes}</span>
      </ScoreDisplay>
      <Stack direction="column" justifyContent="center" spacing={2}>
        <ChoiceButton choiceType="pass" onChoice={onChoice}>
          <Kbd>
            <Icon icon="bi:arrow-left" />
          </Kbd>
          Pass
        </ChoiceButton>
      </Stack>
      {/* <div className="flex-grow" /> */}
      <Stack direction="column" justifyContent="center" spacing={2}>
        <ChoiceButton choiceType="smash" onChoice={onChoice}>
          Smash
          <Kbd>
            <Icon icon="bi:arrow-right" />
          </Kbd>
        </ChoiceButton>
      </Stack>
      <ScoreDisplay className="smashes">
        <Typography>Smashes:</Typography>
        <span>{smashes}</span>
      </ScoreDisplay>
    </Stack>
  )
}

interface ChoiceButtonProps extends ButtonUnstyledProps {
  choiceType: "smash" | "pass"
  onChoice: (type?: "smash" | "pass") => void
}

function ChoiceButton({ choiceType, onChoice, ...props }: ChoiceButtonProps) {
  const onClick = () => onChoice(choiceType)
  useKey(choiceType === "pass" ? "ArrowLeft" : "ArrowRight", onClick)
  return (
    <ButtonUnstyled
      {...props}
      onClick={onClick}
      component={ChoiceButtonRoot}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    />
  )
}
