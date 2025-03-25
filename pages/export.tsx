import { Box, Button, Card, CardContent, CardHeader, css, Theme, Grid, styled, Typography, useTheme } from '@mui/material'
import type { NextPage } from 'next'
import { useSmash } from '../lib/SmashContext'
import html2canvas from 'html2canvas'
import { Icon } from '@iconify/react'
import { Session } from 'next-auth'
import * as React from 'react'
import ExportControlAutocomplete, { PokeHighlight } from '../components/ExportControlAutocomplete'

const headerCSS = css`
  -webkit-text-stroke: 1pt #3b4cca;
  font-weight: bold;
  font-family: Pokemon;
  cursor: default;
  user-select: none;
  font-size: 2rem;
  @media screen and (min-width: 600px) {
    font-size: calc(1rem + 4vh);
  }
`

const onClone = () => {}

const Export: NextPage = () => {
  const theme = useTheme()
  const { session, score } = useSmash()
  const capture = React.useRef<HTMLDivElement>(null)
  const [highlights, setHighlights] = React.useState<PokeHighlight[]>([])

  const downloadStatsJSON = async () => {
    if (!capture.current) return
    const canvas = await html2canvas(capture.current, { backgroundColor: null })
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'PokeSmash_stats.png'
    a.click()
  }
  const downloadStats = async () => {
    if (!capture.current) return
    const canvas = await html2canvas(capture.current, { backgroundColor: null })
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'PokeSmash_stats.png'
    a.click()
  }
  return (
    <Box
      sx={{
        py: { md: 0, lg: 2, xl: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
      <ExportControls
        theme={theme}
        session={session}
        score={score}
        highlights={highlights}
        onAddHighlight={(highlight) =>
          setHighlights((cur) => {
            return [...cur, highlight]
          })
        }
      />
      <div ref={capture} className="border-2 border-gray-400 border-solid pt-2 py-8 px-4 rounded-2xl bg-slate-800 flex flex-col items-center w-1/2 select-none shadow-md">
        <div className="relative ">
          <Typography
            variant="h4"
            component="h1"
            css={headerCSS}
            gutterBottom
            sx={{
              color: '#FFDE00',
              mt: { sm: 0, '2xl': 5 },
            }}>
            Poké
            <Typography
              display="inline"
              css={css`
                margin-left: 8px;
                font-family: 'Lilita One';
                font-weight: 600;
                color: ${theme.palette.error.main};
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-stroke-color: transparent;
                /* cursor: url(https://cdn.7tv.app/emote/609f355eb55466cf076467b1/1x), default; */
                background-size: 120%;
                background-position: center;
                font-size: 2rem;
                @media screen and (min-width: 600px) {
                  font-size: calc(1rem + 4vh);
                }
              `}>
              SMASH
            </Typography>
          </Typography>
          <Typography className="absolute right-2 top-2/3  font-medium text-2xl" fontFamily="Lilita One" sx={{ color: theme.palette.smash.main }}>
            Mental Health Report
          </Typography>
        </div>
        <div className="flex flex-row items-center justify-around w-2/3">
          <div className="flex flex-col items-center">
            <Typography fontFamily="Lilita One" variant="h4" fontWeight={400} color={theme.palette.pass.main}>
              Passes
            </Typography>
            <div className="text-2xl font-bold">{score.passes}</div>
          </div>
          <div className="flex flex-col items-center">
            <Typography fontFamily="Lilita One" variant="h4" fontWeight={400} color={theme.palette.smash.main}>
              Smashes
            </Typography>
            <div className="text-2xl font-bold">{score.smashes}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-12 items-center w-1/2 ">
        <Button
          className="fancy-bg text-white rounded-xl self-end group"
          size="large"
          endIcon={<Icon className="ml-2 transform-gpu transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0.5" icon="fa-solid:download" />}
          onClick={downloadStatsJSON}>
          <span className="transform-gpu transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0.5">Export Stats</span>
        </Button>
        <Button
          className="fancy-bg text-white rounded-xl self-end group"
          size="large"
          endIcon={<Icon className="ml-2 transform-gpu transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0.5" icon="fa-solid:file-download" />}
          onClick={downloadStats}>
          <span className="transform-gpu transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0.5">Download Stats</span>
        </Button>
      </div>
    </Box>
  )
}
export default Export

interface ExportControlsProps {
  theme: Theme
  session: Session | null
  score: ReturnType<typeof useSmash>['score']
  highlights: PokeHighlight[]
  onAddHighlight: (highlight: PokeHighlight) => void
}

const ExportControls = ({ theme, session, score, highlights, onAddHighlight }: ExportControlsProps) => {
  const capture = React.useRef<HTMLDivElement>(null)

  const downloadStatsJSON = async () => {
    if (!capture.current) return
    const canvas = await html2canvas(capture.current, { backgroundColor: null })
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'PokeSmash_stats.png'
    a.click()
  }
  const downloadStats = async () => {
    if (!capture.current) return
    const canvas = await html2canvas(capture.current, { backgroundColor: null })
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'PokeSmash_stats.png'
    a.click()
  }
  return (
    <Grid container spacing={2} className="fixed w-full h-1/4 top-0 border-b-slate-300 border-b-2 border-0 border-solid">
      <Grid item xs md={6}>
        yo
      </Grid>
      <Grid item xs>
        yo
      </Grid>
      <Grid item xs md={6}>
        yo
      </Grid>
      <Grid item xs md={12}>
        <ExportControlAutocomplete score={score} />
      </Grid>
    </Grid>
  )
}
interface PokemonChoiceCardProps {
  id: number
  choice: 'pass' | 'smash'
}
const PokemonChoiceCard = ({ id, choice }: PokemonChoiceCardProps) => {
  return (
    <StyledCard>
      <Box component="div">
        <PokemonImg />
      </Box>
    </StyledCard>
  )
}

const StyledCard = styled('div')(
  ({ theme }) => css`
    width: 100%;
    height: 2rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-color: ${theme.palette.background.default};
    display: flex;
    align-items: center;
    justify-content: center;
    &.smash {
      --choice: ${theme.palette.smash.main};
    }
    &.pass {
      --choice: ${theme.palette.pass.main};
    }
  `
)

const PokemonImg = styled('img')(
  ({}) => css`
    width: 100%;
  `
)
