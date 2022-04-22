import { Icon } from '@iconify/react'
import { css, IconButton, Stack, Tooltip, useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import * as React from 'react'

import IdField from '../components/IdField'
import KeyBinds from '../components/KeyBinds'
import LoginButton from '../components/LoginButton'
import PokeInfo from '../components/PokeInfo'
import SmashPass from '../components/SmashPass'
import { SwipeRef } from '../components/SwipeCards'
import UserStats from '../components/UserStats'
import { useSmash } from '../lib/SmashContext'
import Link from '../src/Link'

import type { NextPage } from 'next'
const headerCSS = css`
  -webkit-text-stroke: 1pt #3b4cca;
  font-weight: bold;
  font-family: Pokemon;
  cursor: default;
  user-select: none;
  /* font-size: 2rem; */
  font-size: 4vh;
  @media screen and (min-width: 800px) {
    font-size: calc(1rem + 4vh);
  }
`

const Home: NextPage = () => {
  const theme = useTheme()
  const { error, score, currentId } = useSmash() as NonNullable<ReturnType<typeof useSmash>>
  const cardRef = React.useRef<SwipeRef>(null)
  const onButtonPress = React.useCallback(
    (ch: 'smash' | 'pass' | undefined) => {
      if (currentId > 898) return
      cardRef.current?.swipe(ch === 'smash' ? 'right' : 'left')
    },
    [currentId, cardRef]
  )
  const [seenSupport, setSeenSupport] = React.useState(false)

  return (
    <>
      <Box
        sx={{
          py: { md: 0, lg: 2, xl: 4 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}>
        <Typography
          variant="h4"
          component="h1"
          className="mt-4"
          css={headerCSS}
          gutterBottom
          sx={{
            color: '#FFDE00',
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
              cursor: url(https://cdn.7tv.app/emote/609f355eb55466cf076467b1/1x), default;
              background-size: 120%;
              background-position: center;
              transition: color 0.4s ease-in-out;
              font-size: inherit;
              &:hover {
                color: transparent;
                background-image: url(https://cdn.7tv.app/emote/609f355eb55466cf076467b1/4x);
              }
            `}>
            SMASH
          </Typography>
        </Typography>
        <PokeInfo cardRef={cardRef} />

        {error && <div>Error! {error.message || 'Please Reload'}</div>}
        <Stack direction="column" sx={{ height: 400, mt: '1rem' }} spacing={4}>
          <Typography component="div" className="flex flex-row gap-2 justify-center items-center text-lg md:text-xl lg:text-2xl xl:text-3xl" fontWeight="bold" align="center">
            Pokemon <IdField /> of 898
          </Typography>
          <SmashPass smashes={score.smashes} passes={score.passes} onChoice={onButtonPress} />

          <UserStats />
        </Stack>
        <Box className="pointer-events-none fixed right-0 top-0 h-full md:h-auto">
          <LoginButton />
        </Box>
        <KeyBinds />
        <Footer>
          <CreatedCard sx={{ fontSize: [16, 18, 24, 28], fontFamily: 'Lilita One' }}>
            <div className="hidden md:inline">A </div>
            <Link
              href="https://twitch.tv/devJimmyboy"
              target="TwitchLink"
              sx={(theme) => ({
                textDecoration: 'none',
                color: theme.palette.twitch.muted.jiggle,
                fontWeight: 400,
                textShadow: '2px 2px 1px #000',
                transition: 'text-shadow 200ms ease-in-out',
                'div:hover > &': {
                  textShadow: '4px 4px 2px #000',
                },
              })}>
              Jimmyboy
            </Link>
            <div className="hidden md:inline"> app</div>
          </CreatedCard>
          <div className="flex-grow" />
          <div className="flex flex-col items-start md:items-end h-32 gap-4 mx-6 my-6 w-24">
            <Tooltip className="pointer-events-auto " title="Join our Discord for future projects and updates!" placement="left-start">
              <IconButton className="discord-bg w-10 h-10" target="_blank" href="https://discord.gg/KA49N8H">
                <Icon fontSize={18} icon="fa-brands:discord" />
              </IconButton>
            </Tooltip>
            <div className="pointer-events-auto flex flex-row-reverse md:flex-row items-center relative">
              <Blurb className={`absolute text-xs md:text-sm pointer-events-none text-center transition-opacity ${seenSupport ? 'opacity-0 ' : ''}`}>
                Support me
                <br />
                for more sites like this!
              </Blurb>
              <IconButton
                className={`fancy-bg w-10 h-10 ${seenSupport ? '' : 'animate-pulse'}`}
                target="_blank"
                href="https://www.patreon.com/devJimmyboy"
                onMouseLeave={() => setSeenSupport(true)}
                onMouseEnter={() => setSeenSupport(false)}>
                <Icon fontSize={18} icon="fa-brands:patreon" />
              </IconButton>
            </div>
          </div>
        </Footer>
      </Box>
    </>
  )
}

export default Home
const Footer = styled('footer')`
  @media screen and (min-width: 800px) {
    bottom: 0;
    top: unset;
    width: 100%;
    gap: unset;
    align-items: end;
    flex-direction: row;
  }
  left: 0;
  top: 0;
  align-items: start;
  gap: 0.25em;
  position: fixed;
  pointer-events: none;
  display: flex;
  flex-direction: column;
`

const CreatedCard = styled('div')`
  @media screen and (min-width: 800px) {
    border-radius: 0.45em 0.45em 0 0;
    padding: 0.325em 0.825em;
  }
  background: ${(props) => props.theme.palette.twitch.main};
  pointer-events: auto;
  user-select: none;
  font-size: 18px;
  padding: 0.125em 0.5em;

  border-radius: 0 0 0.45em 0.45em;

  margin-left: 1em;
`

const Blurb = styled('span')`
  user-select: none;
  display: flex;
  position: relative;
  padding: 0.25rem;
  @media screen and (min-width: 800px) {
    right: calc(15px + 3rem);
    left: unset;
  }
  width: max-content;

  left: calc(15px + 3rem);
  background: linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%);
  border-radius: 0.45em;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  &:after {
    content: '';
    position: absolute;
    display: block;
    width: 0;
    z-index: 1;
    border-style: solid;
    border-width: 10px 15px 10px 0;
    top: 50%;
    @media screen and (min-width: 800px) {
      right: -15px;
      left: unset;
      border-width: 10px 0 10px 15px;
      border-color: transparent #ff8e53;
    }
    left: -15px;
    margin-top: -10px;
    border-color: transparent #fe6b8b;
  }
`
