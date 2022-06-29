import { FormHelperText, Box, Button, Card, Fade, FormControl, Input, Paper, Popper, TextField, Typography, useTheme, InputAdornment } from '@mui/material'
import { get, getDatabase, onValue, ref } from 'firebase/database'
import { addDoc, collection, getFirestore } from 'firebase/firestore'
import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { createFirebaseApp } from '../../firebase/clientApp'
import { HexColorPicker } from 'react-colorful'
import { useBoolean } from 'react-use'
import { debounce } from 'lodash'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import CustomToast from '../../components/CustomToast'
import Head from 'next/head'

const app = createFirebaseApp()

const Admin: NextPage = (props) => {
  const router = useRouter()
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/')
      // The user is not authenticated, handle it here.
    },
  })
  const [allowed, setAllowed] = React.useState(false)

  React.useEffect(() => {
    if (!session) return
    if (session.user.name.toLowerCase() === 'devjimmyboy') {
      setAllowed(true)
    } else {
      setAllowed(false)
      router.push('/')
    }
  }, [session, router])
  if (status === 'loading') {
    return <div>Loading or not authenticated...</div>
  }
  if (!allowed) {
    return (
      <>
        <div>Not allowed...</div>
      </>
    )
  }

  return (
    <Box className="w-full h-full flex flex-col items-center pt-20 gap-10">
      <Typography className="select-none" variant="h2" component="h2" align="center">
        Welcome, <span className="text-blue-500 filter drop-shadow-lg">{session?.user.name}</span>
      </Typography>
      <MsgForm />
    </Box>
  )
}
export default Admin

interface PokemonDataProps {}

type MsgFormData = {
  title: string
  message: string
  for: string
  icon: string
  color: string
  played?: boolean
  url?: string
}

const MsgForm = () => {
  const [isColorOpen, openColor] = useBoolean(false)
  const {
    control,
    watch,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<MsgFormData>({
    defaultValues: {
      for: 'all',
      title: '',
      color: '#f2f2f2',
      url: '',
      icon: 'fa-solid:comment',
      message: '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    const db = getFirestore(app)
    console.log(data)
    const msgCollection = collection(db, 'messages')
    const docRef = await addDoc(msgCollection, data)
    toast.success('Message added!')
  })
  return (
    <>
      <Head>
        <title>PokeSmash - Admin Dashboard</title>
        <meta name="title" content="PokeSmash - Admin Dashboard" />
        <meta name="description" content={`Admin area for PokeSmash. Hey, wait! You shouldn't be seeing this! Why am I making a description for this page?`} />
      </Head>
      <Paper
        component="form"
        onSubmit={onSubmit}
        className=" w-2/3 items-center p-4 flex flex-col gap-2"
        sx={(theme) => ({
          bgcolor: theme.palette.background.default,
        })}>
        <Typography variant="h4" component="h4" align="center">
          Send Notification:
        </Typography>
        <Controller name="for" control={control} render={({ field }) => <TextField label="Send to..." {...field} />} />
        <div className="flex flex-row gap-6 justify-around items-end">
          <Controller
            name="icon"
            control={control}
            render={({ field }) => {
              const color = watch('color')
              return (
                <FormControl>
                  <FormHelperText>Icon</FormHelperText>

                  <Input
                    {...field}
                    type="text"
                    placeholder="icon"
                    endAdornment={
                      <InputAdornment position="end" className="bg-gray-800 text-lg pointer-events-none">
                        <Icon icon={field.value} color={color} />
                      </InputAdornment>
                    }></Input>
                </FormControl>
              )
            }}
          />
          <Controller
            name="color"
            control={control}
            render={({ field }) => {
              field.onChange = debounce(field.onChange, 200)
              return (
                <div>
                  <ColorPreview onClick={openColor} color={field.value} />
                  <Popper open={isColorOpen} anchorEl={() => document.querySelector('#colorSelect') as HTMLDivElement} placement="right-end">
                    <div ref={field.ref}>
                      <HexColorPicker {...{ ...field, ref: undefined }} />
                    </div>
                  </Popper>
                </div>
              )
            }}
          />
        </div>
        <Controller name="title" control={control} render={({ field }) => <TextField label="Title:" {...field} />} />
        <Controller name="message" control={control} render={({ field }) => <TextField label="Message to Send:" {...field} />} />

        <div className="flex flex-row gap-8">
          <Button
            variant="contained"
            className="mt-2 border-2"
            color="secondary"
            onClick={(e) => {
              const vals = getValues()
              toast.dismiss('msg-test')
              toast(vals.message, {
                id: 'msg-test',
                style: { color: vals.color },
                icon: <Icon icon={vals.icon} color={vals.color} />,
                duration: 60000,
              })
            }}
            type="button">
            Test
          </Button>

          <Button variant="outlined" className="mt-2 border-2" color="primary" type="submit">
            Send
          </Button>
        </div>
      </Paper>
    </>
  )
}
const ColorPreview = ({ color, onClick }: { color: string; onClick: () => void }) => {
  return <div id="colorSelect" className=" rounded-lg w-12 h-9 shadow-lg" style={{ backgroundColor: color }} onClick={onClick}></div>
}
