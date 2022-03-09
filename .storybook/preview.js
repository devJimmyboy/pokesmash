import { muiTheme } from "storybook-addon-material-ui"
import { SessionProvider } from "next-auth/react"
import theme from "../src/theme"
import SmashProvider from "../lib/SmashContext"
import React from "react"
import { ThemeProvider } from "@mui/material"

export const decorators = [
  (/** @type {() => React.ReactElement} */ Story) => (
    <SessionProvider
      basePath={process.env.NEXT_PUBLIC_BASE_PATH}
      session={{
        accessToken: "",
        expires: "",
        user: {
          broadcasterType: "affiliate",
          createdAt: "2020-05-06T21:02:58.000Z",
          email: "",
          id: "",
          name: "devjimmyboy",
          description: "",
          type: "",
          updatedAt: "2020-05-06T21:02:58.000Z",
          displayName: "devJimmyboy",
          offlineImageUrl: "",
          profileImageUrl: "",
          username: "devjimmyboy",
          viewCount: 20000,
        },
      }}>
      <SmashProvider>
        <ThemeProvider theme={theme}>
          <Story />
        </ThemeProvider>
      </SmashProvider>
    </SessionProvider>
  ),
]

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  nextRouter: {
    path: "/",
    asPath: "/",
    query: {},
  },
}
