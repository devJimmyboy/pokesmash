import { Avatar, Container, Grid, IconButton, Stack, Typography } from "@mui/material"
import { GetServerSideProps, NextPage } from "next"
import { User } from "next-auth"
import clientPromise, { ScoreSchema } from "../../lib/mongodb"

import { gsap } from "gsap"
import React, { useEffect, useLayoutEffect } from "react"
import { Icon } from "@iconify/react"
import { useRouter } from "next/router"
import { styled } from "@mui/system"

const ScoreHolder = styled("div")`
  background-position: center;
  background-size: 80%;
  background-repeat: no-repeat;
  background-color: #10151a;
  border-radius: 10px;
  border: 1px solid /* neon green */ #55df55;
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
type ScoreProp = ScoreSchema | string
interface Props {
  user: UserProp
  score: ScoreProp
}

const showdownBuilder = (i: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${i}.gif`
const hdBuilder = (i: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/35.png`

const tl = gsap.timeline({ repeat: -1 })
const UserProfile: NextPage<Props> = ({ user, score }) => {
  const pictureBgRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()
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
      <Stack direction="column" p={6} alignItems="center">
        <IconButton
          className="absolute top-12 left-4 hover:bg-blue-600 bg-blue-500 text-yellow-300"
          onClick={() => router.back()}>
          <Icon icon="fa-solid:arrow-left" />
        </IconButton>
        <div className="flex flex-row gap-6 items-center w-11/12 h-full my-6 relative">
          <div
            ref={pictureBgRef}
            className="rounded-full absolute border-purple-700"
            style={{ width: 112, height: 112 }}
          />
          <Avatar
            className="self-start"
            alt={user.displayName}
            src={user.profileImageUrl}
            sx={{ width: 112, height: 112 }}
          />

          <Typography
            fontSize={32}
            className="border-purple-500 border-4 select-none flex flex-row items-center gap-2 border-solid rounded-lg px-4 bg-purple-500 text-white"
            fontWeight={600}>
            <IconButton
              className="p-0 m-0"
              sx={{ fontSize: "inherit" }}
              onClick={() => router.push(`https://twitch.tv/${user.displayName}`, {}, { shallow: true })}>
              <Icon icon="fa-brands:twitch" display="inline-block" />
            </IconButton>{" "}
            {user.displayName}
          </Typography>
        </div>
        {typeof score !== "string" ? (
          <Grid container spacing={2}>
            {Object.values(score.choices).map((choice, i) => (
              <Grid item xs={6} sm={6} md={4} lg={3} key={i}>
                <ScoreHolder
                  className="w-20 h-20"
                  style={{ backgroundImage: `url(${showdownBuilder(i + 1)})`, backgroundSize: "80%" }}>
                  {choice as string}
                </ScoreHolder>
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
  const { user } = context.query
  const client = await clientPromise
  const db = client.db()
  const users = db.collection<User>("users")
  const userInfo = await users.findOne({ name: user }).then((doc) => {
    if (doc) {
      return { ...doc, _id: null }
    } else {
      return "User not found"
    }
  })
  const scores = db.collection<ScoreSchema>("scores")
  const scoreInfo = await scores.findOne({ $or: [{ id: user }, { name: user }] }).then((score) => {
    if (score) {
      return { ...score, _id: null }
    } else {
      return "User has not Smashed nor Passed a Single Pokemon"
    }
  })

  return {
    props: {
      user: userInfo,
      score: scoreInfo,
    },
  }
}
