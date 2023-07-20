import { Icon } from '@iconify/react'
import { Avatar, Grid, IconButton, Stack, Tab, TabProps, Tabs, TabsProps, Tooltip, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { gsap } from 'gsap'
import { NextPage } from 'next'
import { User } from 'next-auth'
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useLayoutEffect } from 'react'

import PokemonSquare from '../components/PokemonSquare'
import { ScoreDisplay } from '../components/SmashPass'
import { useSmash } from '../lib/SmashContext'
import { NUM_POKEMON } from '../src/constants'
import Link from '../src/Link'

const ScoreHolder = styled('div')`
  background-position: center;
  background-size: 80%;
  background-repeat: no-repeat;
  background-color: #10151a;
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  font-weight: 700;
`

interface Error {
  error: string
}

type UserProp = User | string
type ScoreProp = {
  choices: { [key: string]: 'smash' | 'pass' }
  smashCount: number
  passCount: number
}
type ScoreError = string
interface Props {}

const tl = gsap.timeline({ repeat: -1 })

const UserProfile: NextPage<Props> = ({}) => {
  const { style, score } = useSmash()
  const pictureBgRef = React.useRef<HTMLDivElement>(null)

  const [tab, setTab] = React.useState<number>(1)
  const user: Partial<UserProp> = {
    name: 'Anonymous (You)',
    profileImageUrl: '',
    displayName: 'Anonymous (You)',
    username: 'Anonymous',
  }

  useEffect(() => {
    if (pictureBgRef.current) {
      tl.fromTo(
        pictureBgRef.current,
        { scale: 1, autoAlpha: 1, borderWidth: 8 },
        {
          scale: 1.25,
          autoAlpha: 0,
          duration: 2,
          borderWidth: 0,
          ease: 'cubic.bounce',
        }
      )
      tl.play()
    }
  }, [pictureBgRef])

  if (!score) {
    return <div className="w-full h-full flex flex-col items-center justify-center">{'Unknown Error Occured.'}</div>
  } else
    return (
      <>
        <Head>
          <title>{`PokeSmash - Your Stats`}</title>
          <meta name="title" content={`PokeSmash - Your Stats`} />
          <meta name="description" content={`The user page for Yourself. Shows the Smashes and Passes you chose.`} />
        </Head>
        <Stack className="poke-scrollbar" sx={{ overflow: 'hidden', height: '100vh' }} direction="column" p={6} pb={2} alignItems="center">
          <Tooltip
            title="Go Back"
            sx={{
              position: 'fixed',
              top: 96,
              left: 10,
            }}>
            <IconButton className="fancy-bg w-10 h-10 p-0 m-0" LinkComponent={Link} href="/">
              <Icon icon="fa-solid:arrow-left" />
            </IconButton>
          </Tooltip>
          <div className="flex flex-row gap-6 items-center w-11/12 my-2 md:my-4 lg:my-6 ">
            <div ref={pictureBgRef} className="rounded-full absolute w-16 h-16 md:w-24 md:h-24 xl:w-32 xl:h-32 border-purple-700" />
            <Avatar className=" w-16 h-16 md:w-24 md:h-24 xl:w-32 xl:h-32 " alt={user?.name} src={user?.profileImageUrl} />

            <Typography fontSize={32} className="border-purple-500 border-4 select-none flex flex-row items-center gap-2 border-solid rounded-lg px-4 bg-purple-500 text-white" fontWeight={600}>
              {user.displayName}
            </Typography>
            <div className="flex-grow" />
            <Typography fontSize={32} fontWeight={600} justifySelf="flex-end" alignSelf="flex-end">
              {score.passes + score.smashes || '?'} / {NUM_POKEMON}
            </Typography>
          </div>
          <StyledTabs value={tab} variant="fullWidth" onChange={(e, nTab) => setTab(nTab)} sx={{ width: '100%' }} aria-label="User's Stats, Smash list, and Pass list.">
            <StyledTab icon={<Image src="https://cdn.7tv.app/emote/60aeafcb229664e866bef5ac/4x.webp" alt="PogO" width={32} height={32} />} label="Passes" iconPosition="start" />
            <StyledTab icon={<Image src="https://cdn.7tv.app/emote/611a4aac62a016377dd91a25/4x.webp" alt="peepoG" width={32} height={32} />} label="Stats" iconPosition="start" />
            <StyledTab icon={<Image src="https://cdn.7tv.app/emote/60b8cce455c320f0e89d3514/4x.webp" alt="EZ" width={32} height={32} />} label="Smashes" iconPosition="start" />
          </StyledTabs>
          <div
            className="relative flex-grow w-full overflow-hidden"
            style={{
              borderRadius: '0 0 0.625rem 0.625rem',
              border: '1px solid #55df55',
              borderTop: 'none',
            }}>
            {tab === 1 ? (
              <StatsPage smashes={score.smashes} passes={score.passes} />
            ) : (
              <div className="absolute h-full w-full overflow-y-auto">
                <Grid
                  container
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}
                  sx={{
                    p: 2,
                    overflowX: 'hidden',
                    overflowY: 'scroll',
                    maxHeight: 'content',
                  }}
                  columns={{ xs: 8, sm: 18, md: 24, lg: 60 }}>
                  {Object.keys(score.choices)
                    .filter((val) => score.choices[val] === (tab === 2 ? 'smash' : 'pass'))
                    .map((id) => (
                      <Grid item xs={2} sm={3} md={3} lg={4} key={id}>
                        <PokemonSquare i={Number(id)} choice={tab === 2 ? 'smash' : 'pass'} style={style || 'showdown'} />
                      </Grid>
                    ))}
                </Grid>
              </div>
            )}
          </div>
        </Stack>
      </>
    )
}
export default UserProfile

interface StyledTabsProps extends TabsProps {
  children?: React.ReactNode
  value: number
  onChange: (event: React.SyntheticEvent, newValue: number) => void
}

const StyledTabs = styled((props: StyledTabsProps) => <Tabs {...props} TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }} />)({
  minHeight: '4em',
  "& div[role='tablist']": {
    gap: '0.25rem',

    justifyContent: 'space-between',
  },
  borderBottom: '1px solid #55df55',
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: '#635ee7',
  },
})

interface StyledTabProps extends TabProps {
  label: string
}

const StyledTab = styled((props: StyledTabProps) => <Tab {...props} />)(({ theme }) => ({
  border: '1px solid #55df55',
  borderBottom: 'none',
  transition: 'all 0.2s',
  borderRadius: '0.625rem 0.625rem 0 0',
  display: 'flex',
  flexDirection: 'row',
  gap: 4,
  boxShadow: 'none',
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.pxToRem(15),
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#fff',
    borderWidth: 2,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}))

interface StatsPageProps {
  smashes: number
  passes: number
}

function StatsPage(props: StatsPageProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-12">
      <Typography fontSize={32} fontWeight={700}>
        More Stats Coming soon...
      </Typography>
      <div className="flex flex-row justify-around w-full">
        <div className="flex flex-col gap-4 items-center">
          <Typography variant="h3" component="h3" fontWeight={600}>
            Passes
          </Typography>
          <ScoreDisplay className="passes p-12" sx={{ fontSize: '64px' }}>
            {props.passes}
          </ScoreDisplay>
        </div>
        <div className="text-opacity-75 text-green-400 rounded-full outline outline-1 outline-current  w-1 fancy-bg" />
        <div className="flex flex-col gap-4 items-center ">
          <Typography variant="h3" component="h3" fontWeight={600}>
            Smashes
          </Typography>
          <ScoreDisplay className="smashes p-12" sx={{ fontSize: '64px' }}>
            {props.smashes}
          </ScoreDisplay>
        </div>
      </div>
    </div>
  )
}
