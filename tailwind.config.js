const defaults = require("tailwindcss/defaultTheme")
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.css",
    "./lib/**/*.{jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: { md: "800px" },
    },
  },
  corePlugins: { preflight: false },
  plugins: [],
}
