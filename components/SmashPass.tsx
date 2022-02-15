import { ButtonUnstyled, buttonUnstyledClasses, ButtonUnstyledProps } from "@mui/base"
import { Button, Stack } from "@mui/material"
import { styled } from "@mui/system"
import { motion } from "framer-motion"
import React from "react"
import { useKey } from "react-use"

interface Props {
  onChoice: (choice: "smash" | "pass" | undefined) => void
}

export default function SmashPass({ onChoice }: Props) {
  return (
    <Stack
      direction="row"
      justifyContent="space-around"
      spacing={6}
      sx={{ width: "50vw", maxWidth: "400px", my: "2em" }}>
      <ChoiceButton choiceType="pass" onChoice={onChoice}>
        Pass
      </ChoiceButton>
      {/* <div className="flex-grow" /> */}
      <ChoiceButton choiceType="smash" onChoice={onChoice}>
        Smash
      </ChoiceButton>
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
