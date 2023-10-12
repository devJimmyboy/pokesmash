import { Icon } from '@iconify/react'
import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material'
import React from 'react'
import { useSmash } from '../lib/SmashContext'
import { signOut } from 'next-auth/react'

type Props = {}

export default function MobileDrawer({}: Props) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="md:hidden">
      <IconButton
        className="fancy-bg"
        onClick={() => setOpen(true)}
        sx={{
          ml: 2,
          mt: 2,
          height: 48,
          width: 48,
          fontSize: '2em',
        }}>
        <Icon icon="mdi:menu" />
      </IconButton>
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        // componentsProps={{
        //   root: {
        //     style: {
        //       background: '#161816',
        //     },
        //   },
        // }}
      >
        <DrawerContent />
      </Drawer>
    </div>
  )
}

const DrawerContent = () => {
  const {
    session,
    hideDesc: [hideDesc, toggleDesc],
  } = useSmash()
  // const signout = useSign
  return (
    <Box sx={{ width: 250, background: '#161816', height: '100%' }} role="presentation">
      <List disablePadding sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 4, gap: 4 }}>
        <div className="flex flex-col items-center justify-center w-full max-h-16">
          <img className="h-12 sm:h-16" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif" alt="pika" />
        </div>
        <ListItemButton href="/">
          <ListItemIcon>
            <Icon icon="mdi:home" fontSize="1.5rem" />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton href={session ? `/users/${session?.user.displayName}` : `/me`}>
          <ListItemIcon>
            <Icon icon="mdi:home" fontSize="1.5rem" />
          </ListItemIcon>
          <ListItemText primary="Your Stats" />
        </ListItemButton>
        <ListItemButton href="/global">
          <ListItemIcon>
            <Icon icon="mdi:earth" fontSize="1.5rem" />
          </ListItemIcon>
          <ListItemText primary="Global Stats" />
        </ListItemButton>
        <NavItemButton
          onClick={() => {
            signOut()
          }}>
          <ListItemIcon>
            <Icon icon="mdi:logout-variant" fontSize="1.5rem" />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </NavItemButton>
        <div className="flex-grow "></div>
      </List>
    </Box>
  )
}

const NavItemButton = styled(ListItemButton)`
  box-shadow: 0 2px 4px #1b63a2ad;
  border-radius: 0;
  padding: 0.5em 1em;
  // gray
  background: none;
  border-top: 2px solid #1e88e5;
  border-bottom: 2px solid #1e88e5;
  max-height: 10rem;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 2em 1em;
  &:hover {
    background: #3b3b3b;
    box-shadow: 0 4px 8px #297fcacf;
  }
`
