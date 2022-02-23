import { createTheme } from '@mui/material/styles';

const twitchColors = {
  main: "#9146FF",
  muted: {
    ice: "#F0F0FF",
    jiggle: "#FAB4FF",
    worm: "#FACDCD",
    isabelle: "#FEEE85",
    droid: "#BEFAE1",
    wipeout: "#00C8AF",
    smoke: "#D2D2E6",
    widow: "#BFABFF",
    peach: "#FC6675",
    pacman: "#FFCA5F",
    felicia: "#57BEE6",
    sonic: "#0014A5",
  },
  accent: {
    dragon: "#8205B4",
    cuddle: "#FA1ED2",
    bandit: "#FF6905",
    lightning: "#FAFA19",
    ko: "#BEFF00",
    mega: "#00FAFA",
    nights: "#41145F",
    osu: "#BE0078",
    sniper: "#FA2828",
    egg: "#00FA05",
    legend: "#69FFC3",
    zero: "#1E69FF",
  }
}

// Create a theme instance.
const theme = createTheme({
  typography: {
    fontFamily: 'Lato, Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontFamily: 'Lilita One',
    },
    h2: {
      fontFamily: 'Lilita One',
    },
    button: {
      fontWeight: 900,
      fontFamily: 'Open Sans',
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#1e88e5',
    },
    secondary: {
      main: '#fb8c00',
    },
    info: {
      main: '#16BAC5',
    },
    smash: {
      main: "#24D896"
    },
    pass: {
      main: "#FE6B8B"
    },
    twitch: twitchColors,
    background: {
      default: '#161816',
      paper: '#4e4e4e',
    },
  },

  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        }
      }
    }
  }
});

export default theme;

declare module '@mui/material/styles' {
  interface Palette {
    smash: Palette['primary'];
    pass: Palette['primary'];
    twitch: typeof twitchColors;

  }
  interface PaletteOptions {
    smash: PaletteOptions['primary'];
    pass: PaletteOptions['primary'];
    twitch: typeof twitchColors;
  }
}