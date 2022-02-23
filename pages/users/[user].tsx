import { Avatar, Container, Grid, IconButton, Stack, Typography } from "@mui/material"
import { GetServerSideProps, NextPage } from "next"
import { User } from "next-auth"

import { gsap } from "gsap"
import React, { useEffect, useLayoutEffect } from "react"
import { Icon } from "@iconify/react"
import { useRouter } from "next/router"
import { styled } from "@mui/system"
import { ObjectId } from "mongodb"
import admin from "../../firebase/adminApp"
import { useSmash } from "../../lib/SmashContext"
import { hdBuilder, showdownBuilder } from "../../lib/utils"

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
type ScoreProp =
  | { id: string; name: string; numCompleted: number; choices: { [key: string]: "smash" | "pass" } }
  | string
interface Props {
  user: UserProp
  score: ScoreProp
}

const tl = gsap.timeline({ repeat: -1 })
const UserProfile: NextPage<Props> = ({ user, score }) => {
  const { style } = useSmash()
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
      <Stack overflow="hidden scroll" direction="column" p={6} alignItems="center">
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
          <div className="flex-grow" />
          <Typography fontSize={32} fontWeight={600} justifySelf="flex-end" alignSelf="flex-end">
            {(typeof score !== "string" && score.numCompleted) || "?"} / 868
          </Typography>
        </div>
        {typeof score !== "string" ? (
          <Grid
            container
            spacing={0}
            sx={{ borderRadius: "10px", border: "1px solid #55df55", overflow: "hidden" }}
            columns={{ xs: 8, sm: 18, md: 24, lg: 60 }}>
            {Object.values(score.choices).map((choice, i) => (
              <Grid item xs={2} sm={3} md={3} lg={4} key={i}>
                <ScoreHolder
                  className="w-full aspect-square"
                  style={{
                    backgroundImage: `url(${style === "hd" ? hdBuilder(i + 1) : showdownBuilder(i + 1)})`,
                    backgroundSize: "80%",
                    imageRendering: style === "hd" ? "auto" : "crisp-edges",
                  }}>
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
  const firestore = admin.firestore()
  const users = firestore.collection("users")
  const userInfo = await users
    .where("name", "==", user as string)
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
  const scores = firestore.collection("scores")
  const scoreInfo = await scores
    .doc(user as string)
    .get()
    .then((score) => {
      const data = score.data()
      if (score.exists) {
        return { ...data, _id: null }
      } else {
        return "User has not Smashed nor Passed a Single Pokemon"
      }
    })
  const props = {
    user: userInfo,
    score: scoreInfo,
  }
  return {
    props: JSON.parse(JSON.stringify(props)),
  }
}
