import { Icon } from '@iconify/react'
import { Avatar, Button, ButtonProps, Card, CardContent, IconButton, Stack } from '@mui/material'
import { styled } from '@mui/system'
import { signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useSmash } from '../lib/SmashContext'
import Link, { NextLinkComposed } from '../src/Link'

const SignInBtn = styled(IconButton)`
  --twitchAlpha: 0.75;
  box-shadow: none;
  text-transform: none;
  font-size: 0.825rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: row;
  gap: 0.125rem;
  padding: 6px 12px;
  border: 3px solid;
  font-weight: 700;
  background-color: transparent;
  color: var(--twitchColor);
  border-color: var(--twitchColor);
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  transition: border color 0.15s ease-in-out;

  &:hover {
    --twitchAlpha: 1;
    border-color: var(--twitchColor);
    box-shadow: none;
  }
  &:active {
    box-shadow: none;
    border-color: var(--twitchColor);
  }
  &:focus {
    border-color: var(--twitchColor);

    box-shadow: 0 0 0 0.2rem var(--twitchColor);
  }
`

export default function LoginButton(props: ButtonProps) {
  const { session } = useSmash()
  // const router = useRouter()
  if (session) {
    return (
      <Stack
        className="items-end md:items-center md:justify-center md:gap-4 md:m-6 md:py-0 mr-2 py-2 justify-between gap-2"
        direction={{ xs: 'column-reverse', md: 'row' }}
        display={{ xs: 'none', md: 'flex' }}>
        <Avatar
          className="pointer-events-auto"
          component={NextLinkComposed}
          sx={{ height: '100%', border: '2px white solid', cursor: 'pointer' }}
          to={`/users/${session.user.name}`}
          src={session.user.profileImageUrl || ''}
        />
        <SignInBtn className="pointer-events-auto" onClick={() => signOut()}>
          <Icon fontSize={24} icon="mdi:logout" />
        </SignInBtn>
      </Stack>
    )
  }
  return (
    <Stack className="items-end md:items-center md:justify-center md:gap-4 md:m-6 md:py-0 mr-2 py-2 justify-between gap-2" direction={{ xs: 'column-reverse', md: 'row' }}>
      <Button
        className="pointer-events-auto"
        variant="contained"
        sx={{
          borderRadius: '0.5rem',
        }}
        LinkComponent={Link}
        href="/me">
        Stats
      </Button>

      <SignInBtn className="pointer-events-auto w-20 h-12 md:w-auto md:h-auto" onClick={() => signIn('twitch')}>
        <Icon className="text-4xl md:text-2xl" height="1em" width="1em" color="var(--twitchColor)" icon="mdi:twitch" />
        <span className="hidden md:inline">Sign in with Twitch</span>
      </SignInBtn>
    </Stack>
  )
}
