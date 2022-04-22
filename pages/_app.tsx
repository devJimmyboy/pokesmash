import '../styles/globals.css'

import { CacheProvider, EmotionCache } from '@emotion/react'
import { Icon } from '@iconify/react'
import { Box } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { SessionProvider } from 'next-auth/react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import * as React from 'react'
import toast, { ToastBar, Toaster } from 'react-hot-toast'
import { FirebaseAppProvider } from 'reactfire'

import { createFirebaseApp } from '../firebase/clientApp'
import FirebaseComponents from '../firebase/FirebaseComponents'
import SmashProvider from '../lib/SmashContext'
import createEmotionCache from '../src/createEmotionCache'
import theme from '../src/theme'

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
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="icon" type="image/png" href="/favicon.png" />
          <title>Pokémon Smash or Pass</title>
          <meta name="title" content="PokeSmash - Pokémon Smash or Pass" />
          <meta
            name="description"
            content="A website that's a means of making the Pokemon Smash or Pass trend have more mainstream accessibility.Even if you have done a Pokémon Smash or Pass, this site will show you how far off the average your opinion is and more!"
          />

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
        <FirebaseAppProvider firebaseApp={createFirebaseApp()}>
          <FirebaseComponents>
            <ThemeProvider theme={theme}>
              <SmashProvider>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline enableColorScheme />
                <div className="h-screen overflow-y-auto overflow-x-hidden">
                  <Component {...pageProps} />
                </div>
                <Toaster position="top-center" gutter={5} toastOptions={{}}>
                  {(t) => {
                    return (
                      <ToastBar
                        style={{
                          backgroundColor: '#222222',
                          outline: 'solid 0.125rem ' + theme.palette.twitch.accent.dragon,
                          color: 'whitesmoke',
                          fontWeight: 600,
                        }}
                        toast={t}>
                        {({ icon, message }) => (
                          <div className="flex flex-row items-center px-1 py-1">
                            <div className="w-4 h-4">{icon}</div>
                            {message}
                            {t.type !== 'loading' && (
                              <Box
                                component="button"
                                sx={{ width: 20, height: 20, outlineColor: theme.palette.pass.main }}
                                className="border-none p-1 ml-4 focus:ring rounded-md bg-transparent hover:bg-gray-50 hover:bg-opacity-50 flex flex-col items-center justify-center transition-colors outline-1 hover:outline-2 outline focus:outline-none"
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
          </FirebaseComponents>
        </FirebaseAppProvider>
      </CacheProvider>
    </SessionProvider>
  )
}
