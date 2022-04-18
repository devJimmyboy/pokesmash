import { ListItemIcon, Switch } from '@mui/material'
import SwitchUnstyled, { switchUnstyledClasses } from '@mui/base/SwitchUnstyled'
import { css, styled } from '@mui/system'
import React from 'react'
import { blue, grey } from '@mui/material/colors'
import { selectUnstyledClasses, OptionUnstyled, optionUnstyledClasses, PopperUnstyled, SelectUnstyledProps, SelectUnstyled } from '@mui/base'
import Image from 'next/image'

type Props = { value: string; onChange: (value: string | null) => void }

export default function StyleForm({ value, onChange }: Props) {
  return (
    <CustomSelect value={value} onChange={onChange}>
      <StyledOption value="showdown">
        <ListItemIconStyled>
          <img height="100%" src=" https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif" />
        </ListItemIconStyled>
        <div className="opt-text">Showdown Style</div>
      </StyledOption>
      <StyledOption value="hd">
        <ListItemIconStyled>
          <img height="100%" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" />
        </ListItemIconStyled>
        <div className="opt-text">HD Style</div>
      </StyledOption>
      <StyledOption value="3d">
        <ListItemIconStyled>
          <img height="100%" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/25.png" />
        </ListItemIconStyled>
        <div className="opt-text">3D Style (Home)</div>
      </StyledOption>
      <StyledOption value="clean">
        <ListItemIconStyled>
          <img height="100%" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/25.svg" />
        </ListItemIconStyled>
        <div className="opt-text">Clean Style</div>
      </StyledOption>
    </CustomSelect>
  )
}

const CustomSelect = (props: SelectUnstyledProps<string>) => {
  const components: SelectUnstyledProps<string>['components'] = {
    Root: StyledButton,
    Listbox: StyledListbox,
    Popper: StyledPopper as any,
    ...props.components,
  }
  return <SelectUnstyled {...props} components={components} />
}

const ListItemIconStyled = styled(ListItemIcon)`
  width: 64px;
  height: 64px;
  filter: drop-shadow(4px 4px 2px rgba(0, 0, 0, 0.4));
`

const PokeSwitch = styled(SwitchUnstyled)`
  &::before {
    display: block;
    content: '';
    width: 100%;
    height: 100%;
    background: url('/sprites/pokemon/other/official-artwork/25.png') center center no-repeat;
    background-size: 100%;
  }

  .${switchUnstyledClasses.thumb} {
    left: 18px;
    top: -4px;
    transform: translateX(18px);

    &::before {
      background-image: url('/sprites/pokemon/versions/generation-v/black-white/animated/25.gif');
    }
  }
`
const StyledButton = styled('button')(
  ({ theme }) => `
  font-family: DM Sans, sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  min-height: calc(2em + 22px);
  max-height: calc(3em + 22px);

  min-width: 50px;
  background: ${grey[700]};
  border: 1px solid ${grey[800]};
  border-radius: 0.75em;
  margin-top: 0.5em;
  padding: 4px 10px;
  text-align: left;
  line-height: 1.5;
  color: ${grey[300]};

  &:hover {
    background: ${theme.palette.mode === 'dark' ? '' : grey[100]};
    border-color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
  }

  &.${selectUnstyledClasses.focusVisible} {
    outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[100]};
  }

  & .MuiListItemIcon-root {
    width: 48px;
    height: 52px;
  }

  & .opt-text {
    display: none;
  }

  &.${selectUnstyledClasses.expanded} {
    &::after {
      content: '▴';
    }
  }

  &::after {
    content: '▾';
    float: right;
  }
  `
)

const StyledListbox = styled('ul')(
  ({ theme }) => `
  font-family: DM Sans, sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 5px;
  margin: 10px 0;
  min-width: 150px;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[300]};
  border-radius: 0.75em;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  overflow: auto;
  outline: 0px;
  `
)

const StyledOption = styled(OptionUnstyled)(
  ({ theme }) => `
    list-style: none;
    padding: 8px;
    border-radius: 0.45em;
    cursor: default;

    &:last-of-type {
      border-bottom: none;
    }

    &.${optionUnstyledClasses.selected} {
      background-color: ${theme.palette.mode === 'dark' ? blue[900] : blue[100]};
      
      color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
    }

    &.${optionUnstyledClasses.highlighted} {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
      color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    }

    &.${optionUnstyledClasses.highlighted}.${optionUnstyledClasses.selected} {
      background-color: ${theme.palette.mode === 'dark' ? blue[900] : blue[100]};
      color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
    }

    &.${optionUnstyledClasses.disabled} {
      color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
    }

    &:hover:not(.${optionUnstyledClasses.disabled}) {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
      color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    }
  `
)

const StyledPopper = styled(PopperUnstyled)`
  z-index: 10;
`

const Paragraph = styled('p')(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-size: 1.3rem;
  margin: 10px 0;
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[800]};
  `
)
