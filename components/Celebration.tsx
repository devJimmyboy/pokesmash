import { Icon } from "@iconify/react";
import {
  debounce,
  IconButton,
  Portal,
  Typography,
  useTheme,
} from "@mui/material";
import { getDatabase } from "firebase/database";
import { gsap } from "gsap";
import { Howl, Howler } from "howler";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import { useHotkeys } from "react-hotkeys-hook";
import { useBoolean, useRafLoop, useWindowSize } from "react-use";
import useSWR from "swr";
import useMediaQuery from "@mui/material/useMediaQuery";

import { createFirebaseApp } from "../firebase/clientApp";
import { pokeClient, useSmash } from "../lib/SmashContext";
import { capitalizeFirstLetter, usePokemonPicture } from "../lib/utils";

// import type { SimulatorRef } from "./Simulator/Simulator"
// import dynamic from "next/dynamic"
// const Simulator = dynamic(() => import("./Simulator/Simulator"), {
//   ssr: false,
// })

var howler = Howler as unknown as HowlerGlobal;
howler.autoUnlock = false;

howler.volume(0.5);
const sounds: { [key: string]: Howl } = {
  crescendo: new Howl({
    src: ["/sounds/crescendo.mp3"],
    // sprite: {
    //   sound: [0, 6850],
    // },
  }),
  confettiPop: new Howl({ src: ["/sounds/pop.mp3"] }),
  kidCheer: new Howl({ src: ["/sounds/kid-cheer.mp3"] }),
  music: new Howl({
    src: ["/sounds/music/rhubarb-pie.mp3"],
    loop: true,
    volume: 0.15,
  }),
};

export interface CelebrationRef {
  start: () => Promise<void>;
  confetti: confetti.CreateTypes | null;
}
var skew = 1;

const ids = {
  root: "#rootText",
  text: "#celebrateText",
  scoreText: "#scoreText",
};

interface Props {}

// const text = ['', 'Hello there. \nMy name is Professor $m0ak.']
const Celebration = React.forwardRef<CelebrationRef, Props>(
  ({}: Props, ref) => {
    const theme = useTheme();
    const {
      score,
      seenBefore: [seenBefore, setSeenBefore],
    } = useSmash();
    const animRef = useRef<confetti.CreateTypes | null>(null);
    const listRef = useRef<number>(null);
    const [timeScale, setTimeScale] = useState(1);
    const [tlTxt, setTlTxt] = useState<GSAPTimeline>(
      gsap.timeline({ paused: true })
    );
    // const simRef = useRef<SimulatorRef>(null)
    // const { width, height } = useWindowSize()
    const [started, start] = useBoolean(false);
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    useEffect(() => {
      if (!started) return;
      gsap.set(ids.scoreText, { autoAlpha: 0 });
      gsap.set(ids.root, { autoAlpha: 0, scale: 0.01 });
    }, [started]);

    useEffect(() => {
      tlTxt.timeScale(timeScale);
    }, [timeScale, tlTxt]);

    const getInstance = useCallback((instance: confetti.CreateTypes | null) => {
      animRef.current = instance;
    }, []);

    const [loopStop, loopStart, isActive] = useRafLoop((time) => {
      if (time < 500) console.log("Rendering");
      if (!animRef.current) {
        return;
      }
      if (skew > 0) skew = Math.max(0.8, skew - 0.001);
      animRef.current({
        particleCount: 1,
        startVelocity: randomInRange(0, -10),
        ticks: 450,
        origin: {
          x: Math.random(),
          // since particles fall down, skew start toward the top
          y: Math.random() * skew - 0.5,
        },
        colors: [
          [
            theme.palette.twitch.main,
            theme.palette.primary.main,
            theme.palette.smash.main,
            theme.palette.pass.main,
          ][Math.floor(Math.random() * 4)],
        ],
        shapes: ["square"],
        gravity: randomInRange(0.4, 0.6),
        scalar: randomInRange(0.4, 1),
        drift: randomInRange(-0.4, 0.4),
      });
    }, false);

    useEffect(() => {
      if (!started) return;
      const totalScore = Object.values(score.choices).filter(
        (v) => v === "smash"
      ).length;
      console.log(totalScore);

      tlTxt
        .to(
          ids.root,
          {
            autoAlpha: 1,
            duration: 0.5,
            scale: 1,
            ease: "bounce",

            onStart() {
              gsap.set(ids.text, { scale: 1 });
            },
          },
          0
        )
        .to(ids.text, {
          duration: 1,
          y: -window.innerHeight / 3,
          ease: "bounce",
          delay: 5,
        })
        .to(ids.scoreText, { duration: 0.25, autoAlpha: 1, ease: "bounce" })
        .fromTo(
          "#scroller",
          { top: "100%" },
          {
            duration: totalScore,
            top: "unset",
            bottom: "100%",
            ease: "linear",
          },
          "+=0.5"
        )
        .to(
          ids.root,
          {
            duration: 4,
            autoAlpha: 0,
            ease: "easeInOut",
            onStart() {
              setTimeScale(1);
              loopStop();
              sounds.music.fade(0.15, 0, 4000);
            },
          },
          "+=1"
        )
        .to(
          "#appControl",
          { autoAlpha: 1, duration: 0.5, ease: "easeInOut" },
          "-=0.5"
        )
        .call(() => {
          sounds.music.stop();
          start(false);
          setSeenBefore(true);
        });
      sounds.confettiPop.once("play", (s) => {});
    }, [started, loopStop, score.choices, setSeenBefore, start, tlTxt]);

    const onStart = useCallback(async () => {
      let tl = gsap.timeline();
      tl.to("#appControl", { autoAlpha: 0, duration: 0.2 });
      tl.to("body", { backgroundColor: "#101010", duration: 7.0 }, 0);

      start(true);
      const audioId = sounds.crescendo.play();
      await tl.play(0).then();
      sounds.crescendo.stop(audioId);
      if (animRef.current) {
        sounds.confettiPop.play();
        if (tlTxt) tlTxt.play();
        animRef.current({
          angle: -90,
          particleCount: 100,
          origin: { x: 0.5, y: -0.1 },
          spread: 45,
        });
      }
      sounds.kidCheer.play();
      loopStart();

      sounds.music.play();
    }, [start, loopStart, isActive, tlTxt]);

    React.useImperativeHandle(
      ref,
      () => ({
        start: onStart,
        stop: () => {
          start(false);
        },
        confetti: animRef.current,
      }),
      [animRef, start, onStart]
    );
    const [muted, setMuted] = useBoolean(false);
    useEffect(() => {
      sounds.music.mute(muted);
    }, [muted]);

    const timeScaleShift = useCallback(() => {
      if (!started) return;
      if (tlTxt.isActive()) {
        setTimeScale(timeScale * 2);
      }
    }, [started, timeScale, tlTxt, setTimeScale]);
    useHotkeys("space", timeScaleShift, {}, [started, timeScale, setTimeScale]);

    if (!started) return null;

    return (
      <>
        <ReactCanvasConfetti
          style={{
            position: "fixed",
            pointerEvents: "none",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
          refConfetti={getInstance}
        />
        <div
          className="flex flex-col items-center justify-center"
          style={{
            position: "absolute",
            zIndex: 999,
            pointerEvents: "auto",
            width: "100vw",
            height: "100vh",
            top: 0,
            left: 0,
          }}
        >
          <div
            id="rootText"
            style={{ backfaceVisibility: "hidden", transform: `translateZ(0)` }}
            className="flex flex-col w-full h-full  items-center justify-center top-0 left-0"
          >
            <div id="scoreText" className="absolute w-full h-full">
              <div className="relative w-full h-full flex flex-col items-center overflow-hidden">
                <ScoresList ref={listRef} score={score} />
              </div>
            </div>
            <Typography
              id="celebrateText"
              variant="h1"
              style={{
                fontSize: "10vw",
                transform: `translateZ(0)`,
                MozOsxFontSmoothing: "grayscale",
                WebkitFontSmoothing: "subpixel-antialiased",
              }}
            >
              Congratulations!
            </Typography>
          </div>
        </div>
        <Portal container={() => document.getElementById("__next")}>
          {isMobile && (
            <div
              style={{ zIndex: 1000 }}
              className="w-screen h-screen absolute top-0 left-0 pointer-events-auto"
              onClick={timeScaleShift}
            />
          )}

          <IconButton
            className="fixed top-4 left-4 w-10 h-10"
            sx={{
              zIndex: 1000,
              backgroundColor: muted
                ? theme.palette.pass.main
                : theme.palette.smash.main,
              "&:hover": {
                backgroundColor: muted
                  ? theme.palette.pass.main
                  : theme.palette.smash.main,
                backgroundOpacity: 0.8,
              },
            }}
            onClick={() => setMuted()}
          >
            <Icon
              fontSize={24}
              icon={muted ? "fa-solid:volume-mute" : "fa-solid:volume"}
            />
          </IconButton>
          <div
            className="fixed bottom-2 left-1/2 transform-gpu -translate-x-1/2"
            style={{
              zIndex: 1000,
            }}
          >
            <Typography
              color="GrayText"
              align="center"
              fontSize={{ md: 16, xs: 20 }}
            >
              {isMobile ? "Tap the Screen" : "Press space"} to speed up credits.
              Current Speed: {timeScale}x
            </Typography>
          </div>
        </Portal>
      </>
    );
  }
);
Celebration.displayName = "Celebration";
export default Celebration;

// const MotionText = motion(Typography)

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
const app = createFirebaseApp();
const db = getDatabase(app);

const ScoresList = React.forwardRef<
  number,
  { score: ReturnType<typeof useSmash>["score"] }
>(({ score }, listRef) => {
  const scores = score.choices;

  const { height, width } = useWindowSize();
  return (
    <div
      id="scroller"
      style={{
        width: width / 2,
        height: Object.values(scores).filter((v) => v === "smash").length * 64,
        position: "absolute",
      }}
    >
      {Object.keys(scores)
        .filter((id) => scores[id] === "smash")
        .map((id) => (
          <ScoreView key={`score-${id}`} index={Number(id)} data={scores[id]} />
        ))}
    </div>
  );
});
ScoresList.displayName = "ScoresList";

interface ScoreViewProps<T> {
  data: T;
  index: number;
  style?: React.CSSProperties;
}

function ScoreView({
  data: choice,
  index: pokemon,
  style,
}: ScoreViewProps<"smash" | "pass" | null>) {
  const { bgUrl, shiny } = usePokemonPicture(pokemon);
  const { data: pokeInfo } = useSWR(`${pokemon}`, (id: string) =>
    pokeClient.getPokemonById(Number(id))
  );
  const scoreRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scoreRef}
      className="score-view flex flex-row items-center h-16 w-full justify-between py-2"
    >
      <div style={{ height: "100%" }}>
        <img
          style={{ height: "100%" }}
          alt={`Pokemon Image - #${pokemon}`}
          src={bgUrl}
        />
      </div>
      <div className="text-2xl text-white font-semibold">
        {pokeInfo && capitalizeFirstLetter(pokeInfo.name)}
      </div>
      <Typography
        sx={(theme) => ({
          color:
            choice === "pass"
              ? theme.palette.pass.main
              : theme.palette.smash.main,
        })}
        fontSize={24}
        fontWeight={700}
      >
        {choice === "pass" ? "Pass" : "Smash"}
      </Typography>
    </div>
  );
}
