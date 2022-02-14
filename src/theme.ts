import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  typography: {
    fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },

  palette: {
    mode: "dark",
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#FFDE00',
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
