import { Box, Typography, css } from '@mui/material'
import React from 'react'
import { Styling } from '../lib/SmashContext'
import { usePokemonPicture } from '../lib/utils'
import { NUM_POKEMON } from '../src/constants'

interface Props {
  i: number
  style: Styling
  choice: 'smash' | 'pass'
}

export default function PokemonSquare({ i, style, choice }: Props) {
  const { bgUrl, shiny } = usePokemonPicture(i < 1 || i > NUM_POKEMON ? undefined : i)
  if (i < 1 || i > NUM_POKEMON) {
    return null
  }

  return (
    <>
      <Box
        className="w-full  aspect-square"
        sx={{
          userSelect: 'none',
          overflow: 'hidden',
          borderRadius: '1rem',
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: '90%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: style === 'showdown' ? 'pixelated' : 'auto',
          backgroundColor: (theme) => `${theme.palette[choice].main}a0`,
        }}>
        <div
          className="flex flex-col items-center justify-center group w-full h-full p-1 "
          css={css`
            &:hover {
              background-color: #22222280;
            }
          `}>
          <Typography className="hidden justify-self-start group-hover:inline text-lg" variant="h4" component="h4" fontWeight={600}>
            {i.toString()}
          </Typography>
          <Typography className="hidden group-hover:inline text-lg" variant="h4" component="h4" fontWeight={700}>
            {choice as string}
          </Typography>
        </div>
      </Box>
    </>
  )
}
