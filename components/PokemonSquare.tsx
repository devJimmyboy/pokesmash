import { Icon } from '@iconify/react'
import { Box, Typography, css, Tooltip } from '@mui/material'
import { motion } from 'framer-motion'
import { clamp } from 'lodash'
import React from 'react'
import { useWindowSize } from 'react-use'
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
  const { width, height } = useWindowSize()
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
            {choice.slice(0, 1).toUpperCase() + choice.slice(1)}
          </Typography>
        </div>
        {shiny && (
          <motion.div
            className="absolute text-yellow-400"
            // custom={matches}
            // initial={{ scale: 0.01, translateX: matches ? 64 : 40, translateY: matches ? -64 : -40 }}
            animate={{ scale: [1, 1.25, 1], rotate: 360 }}
            style={{ translateX: 40, translateY: -40 }}
            transition={{ repeat: Infinity, duration: 1 }}>
            <Tooltip title="Shiny!" placement="right">
              <Icon icon="fa6-solid:star" style={{ fontSize: clamp((32 * width) / 800, 12, 32) }} />
            </Tooltip>
          </motion.div>
        )}
      </Box>
    </>
  )
}
