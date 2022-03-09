import React from "react"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import Home from "../../pages/index"

//👇 This default export determines where your story goes in the story list
export default {
  title: "Pages/Home",
  component: Home,
} as ComponentMeta<typeof Home>

//👇 We create a “template” of how args map to rendering
const HomePage: ComponentStory<typeof Home> = (props) => <Home {...props} />

export const HomeStory = HomePage.bind({})

HomeStory.args = {
  /*👇 The args you need here will depend on your component */
}
