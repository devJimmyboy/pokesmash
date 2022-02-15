import { Icon } from "@iconify/react"
import { Avatar, Button, ButtonProps, Card, CardContent, Stack } from "@mui/material"
import { styled } from "@mui/system"
import classNames from "classnames"
import { useSession, signIn, signOut } from "next-auth/react"

const SignInBtn = styled(Button)`
  --twitchAlpha: 0.75;
  box-shadow: none;
  text-transform: none;
  font-size: 16px;
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
  const cardClasses = classNames("m-4")
  const cardContentClasses = classNames("p-4")
  if (session) {
    return (
      <Stack direction="row" padding="0" m={1.5} spacing={4} alignItems="center" justifyContent="center">
        <Avatar sx={{ height: "100%", border: "2px white solid" }} src={session.user.image || ""} />
        <SignInBtn startIcon={<Icon icon="mdi:logout" />} onClick={() => signOut()}>
          Sign out
        </SignInBtn>
      </Stack>
    )
  }
  return (
    <SignInBtn
      variant="outlined"
      startIcon={<Icon fontSize={32} height="1em" width="1em" color="var(--twitchColor)" icon="mdi:twitch" />}
      onClick={() => signIn("twitch")}>
      Sign in with Twitch
    </SignInBtn>
  )
}
