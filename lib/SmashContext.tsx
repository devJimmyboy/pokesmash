import { Icon } from "@iconify/react";
import { Box } from "@mui/material";
import Chance from "chance";
import { get, getDatabase, ref } from "firebase/database";
import {
  collection,
  CollectionReference,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import gsap from "gsap";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Pokemon, PokemonClient } from "pokenode-ts";
import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useList, useLocalStorage, useSessionStorage } from "react-use";
import { ListActions } from "react-use/lib/useList";
import useSWR, { mutate } from "swr";

import Celebration, { CelebrationRef } from "../components/Celebration";
import ShockValue, { ShockRef } from "../components/ShockValue";
import StyleForm from "../components/StyleForm";
import { createFirebaseApp } from "../firebase/clientApp";
import { onChoice } from "../firebase/utils";

export const pokeClient = new PokemonClient({
  cacheOptions: { maxAge: 60 * 60 * 1000, exclude: { query: false } },
});

declare global {
  interface PokemonModel {
    smashes:
      | {
          [uid: string]: boolean | null;
        }
      | undefined;
    passes:
      | {
          [uid: string]: boolean | null;
        }
      | undefined;
    smashCount: number;
    passCount: number;
  }
}

interface Score {
  choices: {
    [id: string]: "smash" | "pass" | null;
  };
  smashes: number;
  passes: number;
  currentId: number;
  smash: () => Promise<void>;
  pass: () => Promise<void>;
  wipe: () => Promise<void>;
}

export type Styling = "hd" | "showdown" | "3d" | "clean";

interface CtxData {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  chance: Chance.Chance;
  currentId: number;
  setCurrentId: (id: number | ((id: number) => number)) => void;
  pokeInfo: Pokemon | undefined;
  style: Styling | undefined;
  error: any;
  score: Score;
  shockRef: React.RefObject<ShockRef>;
  messages: FBMessage[];
  setMessages: ListActions<FBMessage> | undefined;
  seenBefore: [
    boolean | undefined,
    Dispatch<SetStateAction<boolean | undefined>>,
    () => void
  ];
  startCelebration: (force?: boolean) => Promise<void>;
}
export type FBMessage = {
  id: string;
  title: string;
  message: string;
  icon?: string;
  color?: string;
  duration?: number;
  for: string;
  data?: {
    url?: string;
  };
};

const SmashContext = React.createContext<CtxData>({
  session: null,
  status: "loading",
  currentId: 1,
  setCurrentId: () => {},
  chance: new Chance(),
  pokeInfo: undefined,
  style: "showdown",
  error: undefined,
  shockRef: { current: null },
  score: {
    choices: {},
    smashes: 0,
    passes: 0,
    currentId: 1,
    async smash() {},
    async pass() {},
    async wipe() {},
  },
  messages: [],
  setMessages: undefined,
  seenBefore: [false, () => {}, () => {}],
  startCelebration: () => Promise.resolve(),
});

interface Props {}
const app = createFirebaseApp();
const db = getDatabase(app);
const fs = getFirestore(app);

export default function SmashProvider(props: PropsWithChildren<Props>) {
  const router = useRouter();

  // const pokeRef = ref(db, `pokemon`);
  const [showStyleSwitch, setShowStyleSwitch] = React.useState(true);
  const celebrateRef = React.useRef<CelebrationRef>(null);
  const seenBefore = useLocalStorage<boolean>("seenCreditsBefore", false);

  const startCelebration = async (force?: boolean) => {
    if (seenBefore[0] && !force) return;
    await gsap.to("#appControl", { autoAlpha: 0, duration: 7.5 });
    celebrateRef.current?.start();
  };

  // useEffect(() => {
  //   const onRouteChange = (url: string, { shallow }: { shallow: boolean }) => {
  //     const bool = url.toString().match(/\/?((users|me)(\/.*?)?)?$/y);
  //     console.log(url, bool);

  //     setShowStyleSwitch(!!bool);
  //   };
  //   router.events.on("routeChangeStart", onRouteChange);
  //   return () => {
  //     router.events.off("routeChangeStart", onRouteChange);
  //   };
  // }, [router.events]);

  const { data: session, status } = useSession({ required: false });
  const [style, setStyle] = React.useState<Styling>("showdown");
  const [chance] = React.useState(new Chance());
  useEffect(() => {
    localStorage.setItem("pokemonStyle", style);
  }, [style]);

  const [messages, setMessages] = useList<FBMessage>([]);
  const [score, setScore] = useState<Omit<Score, "smash" | "pass" | "wipe">>({
    smashes: 0,
    passes: 0,
    currentId: 1,
    choices: {},
  });
  // const [dbScore, loadingDbScore, errorDbStore] = useObjectVal(session ? ref(db, `users/${session.user.name.toLowerCase()}`) : null)

  const [seenMessages, setSeenMessages] = useSessionStorage<string[]>(
    "seenMessages",
    []
  );
  const [currentId, setCurrentId] = React.useState<number>(score.currentId);
  const shockRef = React.useRef<ShockRef>(null);

  const {
    error,
    isValidating,
    data: pokeInfo,
  } = useSWR<Pokemon>(
    !currentId || currentId > 898 ? null : currentId.toString(),
    (id) => pokeClient.getPokemonById(Number(id))
  );

  useEffect(() => {
    if (currentId < score.currentId) return;
    setScore((prev) => ({ ...prev, currentId }));
    if (currentId > 898 && !seenBefore[0]) {
      startCelebration(true);
    }
  }, [currentId, score.currentId]);

  const smash = React.useCallback(async () => {
    if (currentId > 898) return;
    const props = {
      id: currentId,
      choice: "smash" as "smash" | "pass",
      type: (score.choices[`${currentId}`]
        ? score.choices[`${currentId}`] === "pass"
          ? "switch"
          : "same"
        : undefined) as "switch" | "same" | undefined,
      session,
    };

    setScore((prev) => {
      if (!prev.choices) prev.choices = {};
      if (prev.choices[`${currentId}`] === "pass") prev.passes--;
      if (prev.choices[`${currentId}`] !== "smash") {
        prev.smashes++;
        prev.choices[`${currentId}`] = "smash";
      }
      return prev;
    });
    onChoice(props);
  }, [currentId, session, score]);
  const pass = React.useCallback(async () => {
    if (currentId > 898) return;
    const props = {
      id: currentId,
      choice: "pass" as "smash" | "pass",
      type: (score.choices[`${currentId}`]
        ? score.choices[`${currentId}`] === "smash"
          ? "switch"
          : "same"
        : undefined) as "switch" | "same" | undefined,
      session,
    };
    setScore((prev) => {
      if (!prev.choices) prev.choices = {};

      if (prev.choices[`${currentId}`] === "smash") prev.smashes--;
      if (prev.choices[`${currentId}`] !== "pass") {
        prev.passes++;
        prev.choices[`${currentId}`] = "pass";
      }
      return prev;
    });
    onChoice(props);
  }, [currentId, session, score]);
  const wipe = React.useCallback(async () => {
    setCurrentId(1);
    setScore((prev) => {
      prev.choices = {};
      prev.currentId = 1;
      prev.smashes = 0;
      prev.passes = 0;
      return prev;
    });
  }, [currentId, session, score]);

  // In app messages
  React.useEffect(() => {
    if (
      seenMessages &&
      messages[0] &&
      messages.filter((msg) => !seenMessages.includes(msg?.id)).length > 0
    ) {
      messages
        .filter((msg) => !seenMessages.includes(msg?.id))
        .forEach((msg, i) => {
          function runMsgToast() {
            toast(msg.message, {
              icon: <Icon icon={msg.icon || "fa-solid:comment"} />,
              style: { color: msg?.color },
              id: msg.id,
              duration: msg?.duration || 15000,
            });
          }
          if (i === 0) runMsgToast();
          else {
            setTimeout(runMsgToast, i * 1000);
          }
          setSeenMessages([...seenMessages, msg.id]);
        });
    }
  }, [messages, seenMessages, setSeenMessages]);

  React.useEffect(() => {
    const uid = session?.user.name.toLowerCase();
    const forArr = ["all"];
    if (uid) forArr.push(uid);
    const messages = query<FBMessage>(
      collection(fs, `messages`) as CollectionReference<FBMessage>,
      where("for", "in", forArr)
    );
    const unsubMessages = onSnapshot<FBMessage>(messages, (payload) => {
      if (payload.empty) return;
      console.log("Messages received: ", payload.size);
      payload.forEach((msg) => {
        setMessages.push({ ...msg.data(), id: msg.id });
      });
    });
    if (!session) return;
    if (currentId === 1) {
      get(ref(db, `users/${uid}/currentId`)).then((currentDbId) =>
        setCurrentId(currentDbId.val())
      );
    }

    const userSmashRef = ref(db, `users/${uid}/smashCount`);
    const userPassRef = ref(db, `users/${uid}/passCount`);

    get(userSmashRef).then((smashCount) => {
      if (!smashCount.exists()) return;
      setScore((prev) => ({
        ...prev,
        smashes: smashCount.val() || 0,
      }));
    });
    get(userPassRef).then((passCount) => {
      if (!passCount.exists()) return;
      setScore((prev) => ({
        ...prev,
        passes: passCount.val() || 0,
      }));
    });
    return () => {
      unsubMessages();
    };
  }, [session, setMessages]);
  useEffect(() => {
    if (
      !session &&
      localStorage.getItem("offlineScore") === null &&
      localStorage.getItem("score") !== null
    ) {
      localStorage.setItem(
        "offlineScore",
        localStorage.getItem("score") as string
      );
      localStorage.removeItem("score");
    }

    async function setScoreFromDb(storageScore: Score) {
      var newChoices:
        | {
            choices: { [key: string]: "smash" | "pass" };
            smashCount: number;
            passCount: number;
            currentId: number;
          }
        | undefined = undefined;
      if (session) {
        const choices = await fetch(
          `/api/user/score?user=${session.user.name.toLowerCase()}`
        ).then((v) => v.json());
        if (storageScore.currentId < choices.currentId) {
          if (choices !== "string") newChoices = choices;
          else console.error("Error getting choices from db");
        }
      }
      setScore((prev) => {
        if (newChoices)
          return {
            ...prev,
            ...storageScore,
            choices: newChoices.choices,
            smashes: newChoices.smashCount,
            passes: newChoices.passCount,
            currentId: newChoices.currentId,
          };
        else return { ...prev, ...storageScore };
      });
      setCurrentId(newChoices?.currentId || storageScore.currentId);
    }
    const storageKey = session ? "score" : "offlineScore";
    const raw = localStorage.getItem(storageKey);
    const storageScore = raw ? (JSON.parse(raw) as Score | null) : null;
    if (storageScore) {
      setScoreFromDb(storageScore);
    }
  }, [session]);
  useEffect(() => {
    const storageKey = session ? "score" : "offlineScore";
    if (status !== "loading")
      localStorage.setItem(storageKey, JSON.stringify(score));
  }, [score]);
  useEffect(() => {
    const storedStyle = localStorage.getItem("pokemonStyle");
    if (storedStyle) setStyle(storedStyle as Styling);
  }, []);

  React.useEffect(() => {
    prefetch(currentId);
  }, [currentId]);

  return (
    <SmashContext.Provider
      value={{
        session,
        status,
        setMessages,
        currentId,
        setCurrentId,
        pokeInfo,
        style,
        error,
        score: { ...score, smash, pass, wipe },
        shockRef,
        messages,
        chance,
        seenBefore,
        startCelebration,
      }}
    >
      <Celebration ref={celebrateRef} />
      <div id="appControl">
        {showStyleSwitch && (
          <Box className="fixed bottom-2 md:bottom-auto md:top-2 left-2 z-50">
            <StyleForm
              value={style || "showdown"}
              onChange={(s) => setStyle(s as Styling)}
            />
          </Box>
        )}

        <ShockValue ref={shockRef} />
        {props.children}
      </div>
    </SmashContext.Provider>
  );
}

async function prefetch(id: number) {
  if (id >= 898) return;
  mutate(`${id + 1}`, pokeClient.getPokemonById(id + 1), {
    populateCache: true,
  });
  // the second parameter is a Promise
  // SWR will use the result when it resolves
}

export function useSmash() {
  const ctx = React.useContext(SmashContext);
  return ctx;
}
