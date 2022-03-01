import { Box, Card, Paper, Typography, useTheme } from "@mui/material"
import { getDatabase, onValue, ref } from "firebase/database"
import type { NextPage } from "next"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import React, { useEffect } from "react"
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts"
import { createFirebaseApp } from "../../firebase/clientApp"
const app = createFirebaseApp()

const Admin: NextPage = (props) => {
  const router = useRouter()
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/")
      // The user is not authenticated, handle it here.
    },
  })
  const [allowed, setAllowed] = React.useState(false)

  React.useEffect(() => {
    if (!session) return
    if (session.user.name.toLowerCase() === "devjimmyboy") {
      setAllowed(true)
    } else {
      setAllowed(false)
      router.push("/")
    }
  }, [session])
  if (status === "loading") {
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
    <Box className="w-full h-full flex flex-col items-center justify-center gap-10">
      <Typography variant="h2" component="h2" justifySelf="flex-start">
        Welcome, {session?.user.name}
      </Typography>
      <PokemonData />
    </Box>
  )
}
export default Admin

interface PokemonDataProps {}
const PokemonData: React.FC<PokemonDataProps> = ({}) => {
  const db = getDatabase(app)
  const [pokeData, setPokeData] = React.useState<{ smashCount: number; passCount: number; id: number }[]>([])
  useEffect(() => {
    const unsub = onValue(ref(db, "pokemon"), (snap) => {
      const data = snap.val()
      const pokeData = Object.keys(data).map((key) => {
        return {
          id: parseInt(key),
          smashCount: data[key].smashCount,
          passCount: data[key].passCount,
        }
      })
      setPokeData(pokeData)
    })
    return () => {
      unsub()
    }
  }, [])
  const theme = useTheme()
  return (
    <Paper
      className="flex flex-col items-center justify-center"
      sx={{ width: 500, height: 400, bgcolor: theme.palette.background.default, color: theme.palette.info.dark }}>
      <Typography variant="h5" component="h5">
        Pokemon
      </Typography>
      <BarChart data={pokeData} width={500} height={300}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="id" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar label={<div>yo</div>} dataKey="passCount" fill={theme.palette.pass.main} />
        <Bar dataKey="smashCount" fill={theme.palette.smash.main} />
      </BarChart>
    </Paper>
  )
}
