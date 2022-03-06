import { Box, Typography } from "@mui/material"
import React from "react"
import { Styling } from "../lib/SmashContext"
import { usePokemonPicture } from "../lib/utils"

interface Props {
  i: number
  style: Styling
  choice: "smash" | "pass"
}

export default function PokemonSquare({ i, style, choice }: Props) {
  const { bgUrl, shiny } = usePokemonPicture(i + 1)

  return (
    <Box
      className="w-full relative p-1 aspect-square flex flex-col items-center justify-center group"
      sx={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        imageRendering: style === "showdown" ? "pixelated" : "auto",
        backgroundColor: (theme) => `${theme.palette[choice].main}a0`,
      }}>
      <Typography className="hidden justify-self-start group-hover:inline" variant="h4" component="h4" fontWeight={600}>
        {(i + 1).toString()}
      </Typography>
      <Typography className="hidden group-hover:inline" variant="h4" component="h4" fontWeight={700}>
        {choice as string}
      </Typography>
    </Box>
  )
}
