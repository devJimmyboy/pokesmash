import { Icon } from "@iconify/react"
import { Avatar, Button, ButtonProps, Card, CardContent, IconButton, Stack } from "@mui/material"
import { styled } from "@mui/system"
import classNames from "classnames"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import Link from "../src/Link"

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
  font-family: "Segoe UI", "Helvetica Neue", sans-serif;
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
  const { data: session } = useSession()
  const router = useRouter()
  if (session) {
    return (
      <Stack direction="row" padding="0" m={1.5} spacing={4} alignItems="center" justifyContent="center">
        <Avatar
          sx={{ height: "100%", border: "2px white solid", cursor: "pointer" }}
          onClick={() => router.push(`/users/${session.user.name}`)}
          src={session.user.profileImageUrl || ""}
        />
        <SignInBtn onClick={() => signOut()}>
          <Icon fontSize={24} icon="mdi:logout" />
        </SignInBtn>
      </Stack>
    )
  }
  return (
    <Stack direction="row" padding="0" m={1.5} spacing={4} alignItems="center" justifyContent="center">
      <Button
        variant="contained"
        sx={{
          borderRadius: "0.5rem",
        }}
        LinkComponent={Link}
        href="/me">
        Stats
      </Button>

      <SignInBtn onClick={() => signIn("twitch")}>
        <Icon fontSize={24} height="1em" width="1em" color="var(--twitchColor)" icon="mdi:twitch" />
        Sign in with Twitch
      </SignInBtn>
    </Stack>
  )
}
