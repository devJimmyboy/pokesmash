import { Chip, css } from "@mui/material"
import React from "react"
import { capitalizeFirstLetter } from "../lib/utils"

interface Props {
  type: PokeType
}

export default function Type({ type }: Props) {
  return (
    <Chip
      variant="outlined"
      css={css`
        font-weight: bold;
        background-color: ${typeToColor[type]};
        height: 25px;
        border-radius: 8px;
        padding: 0.25em;
        border-color: #d2d2d2;
        border-width: 0;
        box-shadow: 0px 4px 4px -2px ${typeToColor[type] + "80"};
        & .MuiChip-label {
          padding: 0.35em;
        }
      `}
      label={capitalizeFirstLetter(type)}
    />
  )
}

export type PokeType =
  | "normal"
  | "fire"
  | "fighting"
  | "water"
  | "flying"
  | "grass"
  | "poison"
  | "electric"
  | "ground"
  | "psychic"
  | "rock"
  | "ice"
  | "bug"
  | "dragon"
  | "ghost"
  | "dark"
  | "steel"
  | "fairy"

type TypeToColor = {
  [t in PokeType]: string
}

export const typeToColor: TypeToColor = {
  bug: "#A8B820",
  dark: "#705848",
  dragon: "#7038F8",
  electric: "#F8D030",
  fairy: "#EE99AC",
  fighting: "#C03028",
  fire: "#F08030",
  flying: "#A890F0",
  grass: "#78C850",
  ground: "#E0C068",
  ice: "#98D8D8",
  normal: "#A8A878",
  poison: "#A040A0",
  psychic: "#F85888",
  rock: "#B8A038",
  steel: "#B8B8D0",
  water: "#6890F0",
  ghost: "#705898",
}

export type Pokemon = {
  id: number
  name: string
  type: PokeType[]
  image: string
}
