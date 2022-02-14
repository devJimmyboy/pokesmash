import { Switch } from "@mui/material"
import SwitchUnstyled, { switchUnstyledClasses } from "@mui/base/SwitchUnstyled"
import { css, styled } from "@mui/system"
import React from "react"
import { blue, grey } from "@mui/material/colors"

type Props = { style: string; onSwitch: () => void }

export default function StyleSwitch({ style, onSwitch }: Props) {
  return <PokeSwitch checked={style === "showdown"} onChange={onSwitch} />
}

const PokeSwitch = styled(SwitchUnstyled)(
  ({ theme }) => css`
    display: inline-block;
    position: relative;
    width: 64px;
    height: 36px;
    padding: 8px;
    margin-left: 12px;
    margin-right: 10px;

    &.${switchUnstyledClasses.disabled} {
      opacity: 0.4;
      cursor: not-allowed;
    }

    & .${switchUnstyledClasses.track} {
      background-color: ${theme.palette.mode === "dark" ? grey[800] : grey[400]};
      border-radius: 4px;
      width: 100%;
      height: 100%;
      display: block;
    }

    & .${switchUnstyledClasses.thumb} {
      position: absolute;
      display: block;
      background-color: transparent;
      width: 40px;
      height: 40px;
      top: -4px;
      left: -1px;
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);

      &::before {
        display: block;
        content: "";
        width: 100%;
        height: 100%;
        background: url("https://github.com/PokeAPI/sprites/raw/master/sprites/pokemon/other/official-artwork/25.png")
          center center no-repeat;
        background-size: 100%;
      }

      /*&.focusVisible {
    background-color: #79b;
  }*/
    }

    &.${switchUnstyledClasses.focusVisible} .${switchUnstyledClasses.thumb} {
      background-color: ${grey[500]};
      box-shadow: 0 0 1px 8px rgba(0, 0, 0, 0.25);
    }

    &.${switchUnstyledClasses.checked} {
      .${switchUnstyledClasses.thumb} {
        left: 18px;
        top: -4px;
        transform: translateX(18px);

        &::before {
          background-image: url("https://github.com/PokeAPI/sprites/raw/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif");
        }
      }

      .${switchUnstyledClasses.track} {
        background: ${blue[500]};
      }
    }

    & .${switchUnstyledClasses.input} {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      opacity: 0;
      z-index: 1;
      margin: 0;
      cursor: pointer;
    }
  `
)
