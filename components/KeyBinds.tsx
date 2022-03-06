import { Icon } from "@iconify/react"
import { Box, Stack, styled, Typography } from "@mui/material"
import React from "react"

type Props = {}
type Keybind = { icon: string; key: string; use: string }
const keybinds: Keybind[] = [
  { icon: "ep:arrow-up-bold", key: "Up", use: "Next Pokemon" },
  { icon: "ep:arrow-down-bold", key: "Down", use: "Previous Pokemon" },

  { icon: "ep:arrow-left-bold", key: "Left", use: "Pass" },

  { icon: "ep:arrow-right-bold", key: "Right", use: "Smash" },
]
export default function KeyBinds({}: Props) {
  return (
    <KeyBindsContainer className="gap-2" sx={{ color: "GrayText" }}>
      <Typography variant="h5">Keybinds:</Typography>
      {keybinds.map((keybind, i) => (
        <Stack direction="row" alignItems="flex-end" justifyContent="right" width="100%" spacing={2} key={`kbd-${i}`}>
          <Typography variant="body1">{keybind.use}</Typography>
          <kbd>{keybind.icon.length > 0 ? <Icon icon={keybind.icon} /> : keybind.key}</kbd>
        </Stack>
      ))}
    </KeyBindsContainer>
  )
}

const KeyBindsContainer = styled(Box)`
  @media (max-width: 900px) {
    display: none;
  }
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  justify-content: center;
  position: absolute;
  top: 70%;
  right: 0;
  width: 200px;
  padding: 12px;
  font-family: monospace;
  border: 2px solid #2a2a2a;
  border-right: 0;
  border-radius: 12px 0 0 12px;
`
