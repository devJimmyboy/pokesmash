import { Avatar, Box, Container, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material"
import { GetServerSideProps, NextPage } from "next"
import { User } from "next-auth"

import { gsap } from "gsap"
import React, { useEffect, useLayoutEffect } from "react"
import { Icon } from "@iconify/react"
import { useRouter } from "next/router"
import { styled } from "@mui/system"
import admin from "../../firebase/adminApp"
import { useSmash } from "../../lib/SmashContext"
import { usePokemonPicture } from "../../lib/utils"
import { getDatabase, ref, get, onValue } from "firebase/database"
import { createFirebaseApp } from "../../firebase/clientApp"
import Link from "../../src/Link"
import PokemonSquare from "../../components/PokemonSquare"

const ScoreHolder = styled("div")`
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
type ScoreProp = { [key: string]: "smash" | "pass" }
interface Props {
  user: UserProp
}

const tl = gsap.timeline({ repeat: -1 })
const UserProfile: NextPage<Props> = ({ user }) => {
  const db = getDatabase(createFirebaseApp())
  const { style } = useSmash()
  const pictureBgRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [score, setScore] = React.useState<ScoreProp | string>("Loading...")
  const [numSmashed, setNum] = React.useState(0)
  useEffect(() => {
    if (typeof user === "string") {
      return
    }
    const userScoreRef = ref(db, `pokemon`)
    const id = `${user.name.toLowerCase()}`
    const unsubscribe = onValue(userScoreRef, (pokemon) => {
      let choices: ScoreProp = {}
      let numSmashed = 0
      pokemon.forEach((mon) => {
        if (!mon.exists()) {
          return
        }
        const userSmashed = mon.child(`smashes/${id}`).val()
        const userPassed = mon.child(`passes/${id}`).val()
        if (mon.key && (userSmashed || userPassed)) {
          choices[mon.key] = userSmashed ? "smash" : "pass"
          numSmashed++
        }
      })

      setScore(choices)
    })
    return () => {
      unsubscribe()
    }
  }, [db, user])
  useEffect(() => {
    if (pictureBgRef.current) {
      tl.fromTo(
        pictureBgRef.current,
        { scale: 1, autoAlpha: 1, borderWidth: 8 },
        { scale: 1.25, autoAlpha: 0, duration: 2, borderWidth: 0, ease: "cubic.bounce" }
      )
      tl.play()
    }
  }, [pictureBgRef])

  if (typeof user === "string") {
    return <div className="w-full h-full flex flex-col items-center justify-center">{user}</div>
  } else
    return (
      <Stack sx={{ overflow: "hidden" }} direction="column" p={6} alignItems="center">
        <Tooltip className="absolute top-24 left-4" title="Go Back">
          <IconButton className=" w-10 h-10 p-0 m-0" LinkComponent={Link} href="/">
            <Icon icon="fa-solid:arrow-left" />
          </IconButton>
        </Tooltip>
        <div className="flex flex-row gap-6 items-center w-11/12 h-full my-6 ">
          <div
            ref={pictureBgRef}
            className="rounded-full absolute border-purple-700"
            style={{ width: 112, height: 112 }}
          />
          <Avatar
            className="self-start"
            alt={user?.name}
            src={user?.profileImageUrl}
            sx={{ width: 112, height: 112 }}
          />

          <Typography
            fontSize={32}
            className="border-purple-500 border-4 select-none flex flex-row items-center gap-2 border-solid rounded-lg px-4 bg-purple-500 text-white"
            fontWeight={600}>
            <IconButton
              className="p-0 m-0"
              sx={{ fontSize: "inherit" }}
              onClick={() => router.push(`https://twitch.tv/${user?.displayName}`, {}, { shallow: true })}>
              <Icon icon="fa-brands:twitch" display="inline-block" />
            </IconButton>{" "}
            {user.displayName}
          </Typography>
          <div className="flex-grow" />
          <Typography fontSize={32} fontWeight={600} justifySelf="flex-end" alignSelf="flex-end">
            {(typeof score !== "string" && Object.values(score).length) || "?"} / 868
          </Typography>
        </div>
        {typeof score !== "string" ? (
          <Grid
            container
            spacing={0}
            overflow="hidden"
            sx={{ borderRadius: "10px", border: "1px solid #55df55" }}
            columns={{ xs: 8, sm: 18, md: 24, lg: 60 }}>
            {Object.values(score).map((choice, i) => (
              <Grid item xs={2} sm={3} md={3} lg={4} key={i}>
                <PokemonSquare i={i} choice={choice} style={style} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-2xl font-semibold">{score}</div>
        )}
      </Stack>
    )
}
export default UserProfile

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { user } = context.query as { user: string }
  const firestore = admin.firestore()
  const users = firestore.collection("users")
  const userInfo = await users
    .where("username", "==", user.toLowerCase())
    .get()
    .then((q) => {
      const doc = q.docs[0]
      if (doc?.exists) {
        const data = doc.data()
        delete data.email
        return data
      } else {
        return "User not found"
      }
    })

  const props = {
    user: userInfo,
  }
  return {
    props: JSON.parse(JSON.stringify(props)),
  }
}
