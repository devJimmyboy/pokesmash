import { Icon } from "@iconify/react"
import { ButtonUnstyled, buttonUnstyledClasses, ButtonUnstyledProps } from "@mui/base"
import { Button, Stack, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { motion, useAnimation, Variants } from "framer-motion"
import React from "react"
import { useKey } from "react-use"

const MotionButton = motion(Button)
const ChoiceButtonRoot = styled(MotionButton)`
  --bColor: ${({ theme }) => theme.palette.primary.main};
  display: flex;
  gap: 6px;
  width: 250px;
  height: 100px;
  border-radius: 20px;
  border: 4px solid var(--bColor);
  font-size: 2em;
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
  font-size: 32px;
  display: flex;
  padding: 0.75em;
  gap: 2px;
  color: ${(props) => props.theme.palette.text.primary};
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-family: "Lilita One", "Segoe UI", sans-serif;
  border-radius: 15px;
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
  onChoice: (choice: "smash" | "pass" | undefined) => void
}

export default function SmashPass({ onChoice, smashes, passes }: Props) {
  return (
    <Stack direction="row" justifyContent="space-around" spacing={6} className="w-full" sx={{ mt: "2em" }}>
      <Stack direction="column" justifyContent="center" spacing={2}>
        <ChoiceButton choiceType="pass" onChoice={onChoice}>
          <span className="flex-grow">Pass</span>
          <ScoreDisplay className="passes mr-4">{passes}</ScoreDisplay>
        </ChoiceButton>
      </Stack>
      {/* <div className="flex-grow" /> */}
      <Stack direction="column" justifyContent="center" spacing={2}>
        <ChoiceButton choiceType="smash" onChoice={onChoice}>
          <ScoreDisplay className="smashes ml-4">{smashes}</ScoreDisplay>
          <span className="flex-grow">Smash</span>
        </ChoiceButton>
      </Stack>
    </Stack>
  )
}

interface ChoiceButtonProps extends ButtonUnstyledProps {
  choiceType: "smash" | "pass"
  onChoice: (type?: "smash" | "pass") => void
}

function ChoiceButton({ choiceType, onChoice, ...props }: ChoiceButtonProps) {
  const api = useAnimation()
  const variants: Variants = {
    selected: { scale: 1.1, onEnded: () => api.start("idle"), dur: 0.25, className: `selected ${choiceType}` },
    idle: { scale: 1, className: `${choiceType}` },
  }
  const onClick = async () => {
    await api.start("selected")
    onChoice(choiceType)
  }
  useKey(choiceType === "pass" ? "ArrowLeft" : "ArrowRight", onClick)
  return (
    <ButtonUnstyled
      {...props}
      className={`${choiceType}`}
      onClick={onClick}
      animate={api}
      component={ChoiceButtonRoot}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    />
  )
}
