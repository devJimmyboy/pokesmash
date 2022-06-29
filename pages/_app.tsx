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
import { DefaultSeo } from 'next-seo'
import SEO from '../next-seo.config'

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
        <DefaultSeo {...SEO} />
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="icon" type="image/png" href="/favicon.png" />
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
