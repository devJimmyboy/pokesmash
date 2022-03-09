import * as React from "react"
import Head from "next/head"
import "../styles/globals.css"
import { AppProps } from "next/app"
import { ThemeProvider, useTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { CacheProvider, EmotionCache } from "@emotion/react"
import theme from "../src/theme"
import createEmotionCache from "../src/createEmotionCache"
import SmashProvider from "../lib/SmashContext"
import { SessionProvider } from "next-auth/react"
import { Session } from "next-auth"
import toast, { ToastBar, Toaster } from "react-hot-toast"
import { Box, IconButton } from "@mui/material"
import { Icon } from "@iconify/react"
// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

export default function MyApp(props: MyAppProps) {
  const {
    Component,
    emotionCache = clientSideEmotionCache,
    pageProps: { session, ...pageProps },
  } = props
  return (
    <SessionProvider session={session}>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <link rel="icon" type="image/png" href="/favicon.png" />
          <title>Pokémon Smash or Pass</title>
          <meta name="title" content="PokéSmash - Pokémon Smash or Pass" />
          <meta
            name="Description"
            content="A simple concept, really. Smash or Pass has been instilled in society since the rise of dating apps (and possibly longer). Recently, however, YouTube personality Markiplier started a trend applying the simplicity of Smash or Pass to the vast complexity of Pokémon. This website is a means of making that trend have more mainstream accessibility.Even if you have done a Pokémon Smash or Pass, this site will show you how far off the average your opinion is and more!"
          />
          <meta name="robots" content="noindex,nofollow" />

          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://pokesmash.xyz/" />
          <meta property="og:title" content="PokéSmash - Pokémon Smash or Pass" />
          <meta
            property="og:description"
            content="A simple concept, really. Smash or Pass has been instilled in society since the rise of dating apps (and possibly longer). Recently, however, YouTube personality Markiplier started a trend applying the simplicity of Smash or Pass to the vast complexity of Pokémon.
This website is a means of making that trend have more mainstream accessibility.
Even if you have done a Pokémon Smash or Pass, this site will show you how far off the average your opinion is and more!"
          />
          <meta property="og:image" content="/meta.png" />

          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://pokesmash.xyz/" />
          <meta property="twitter:title" content="PokéSmash - Pokémon Smash or Pass" />
          <meta
            property="twitter:description"
            content="A simple concept, really. Smash or Pass has been instilled in society since the rise of dating apps (and possibly longer). Recently, however, YouTube personality Markiplier started a trend applying the simplicity of Smash or Pass to the vast complexity of Pokémon.
This website is a means of making that trend have more mainstream accessibility.
Even if you have done a Pokémon Smash or Pass, this site will show you how far off the average your opinion is and more!"
          />
          <meta property="twitter:image" content="/meta.png" />
        </Head>
        <ThemeProvider theme={theme}>
          <SmashProvider>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline enableColorScheme />
            <div className="h-screen ">
              <Component {...pageProps} />
            </div>
            <Toaster position="top-center" gutter={5} toastOptions={{}}>
              {(t) => {
                return (
                  <ToastBar
                    style={{
                      backgroundColor: "#e2e2e2",
                    }}
                    toast={t}>
                    {({ icon, message }) => (
                      <div className="flex flex-row items-center px-1 py-1">
                        {icon}
                        {message}
                        {t.type !== "loading" && (
                          <Box
                            component="button"
                            sx={{ width: 20, height: 20, outlineColor: theme.palette.pass.main }}
                            className="border-none p-0 ml-4 focus:ring rounded-md bg-transparent hover:bg-gray-50 hover:bg-opacity-50 flex flex-col items-center justify-center transition-colors outline-1 hover:outline-2 outline focus:outline-none"
                            onClick={() => toast.dismiss(t.id)}>
                            <Icon icon="fa6-solid:xmark" />
                          </Box>
                        )}
                      </div>
                    )}
                  </ToastBar>
                )
              }}
            </Toaster>
          </SmashProvider>
        </ThemeProvider>
      </CacheProvider>
    </SessionProvider>
  )
}
