import React from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete'
import useMediaQuery from '@mui/material/useMediaQuery'
import ListSubheader from '@mui/material/ListSubheader'
import Popper from '@mui/material/Popper'
import { useTheme, styled } from '@mui/material/styles'
import { VariableSizeList, ListChildComponentProps } from 'react-window'
import Typography from '@mui/material/Typography'
import { useSmash } from '../lib/SmashContext'
import { usePokemonPicture } from '../lib/utils'
import { Chip } from '@mui/material'
type Props = { score: ReturnType<typeof useSmash>['score'] }

export default function ExportControlAutocomplete({ score }: Props) {
  const sortedScore = Object.keys(score.choices)
    .map((key) => ({ id: key, choice: score.choices[key] }))
    .sort((a, b) => (b.choice === 'pass' ? 1 : -1))
  return (
    <Autocomplete
      id="virtualize-demo"
      sx={{ width: 300 }}
      disableListWrap
      PopperComponent={StyledPopper}
      ListboxComponent={ListboxComponent}
      options={sortedScore}
      groupBy={(option) => option.choice}
      renderInput={(params) => <TextField {...params} label="10,000 options" />}
      renderOption={(props, option) => [props, option]}
      renderGroup={(params) => params}
    />
  )
}
const LISTBOX_PADDING = 8 // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props
  const dataSet = data[index]
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
  }
  const theme = useTheme()
  const { bgUrl, shiny } = usePokemonPicture(dataSet[1]?.id)

  if (dataSet.hasOwnProperty('group')) {
    return (
      <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
        {dataSet.group}
      </ListSubheader>
    )
  }

  return (
    <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
      <img src={bgUrl} alt={dataSet[1].choice} className={`${shiny ? 'shiny' : ''} h-full mr-2`} />
      <Chip color={dataSet[1]?.choice && dataSet[1].choice} label={dataSet[1].choice} />
    </Typography>
  )
}
const OuterElementContext = React.createContext({})

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext)
  return <div ref={ref} {...props} {...outerProps} />
})

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null)
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true)
    }
  }, [data])
  return ref
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(function ListboxComponent(props, ref) {
  const { children, ...other } = props
  const itemData: React.ReactChild[] = []
  ;(children as React.ReactChild[]).forEach((item: React.ReactChild & { children?: React.ReactChild[] }) => {
    itemData.push(item)
    itemData.push(...(item.children || []))
  })

  const theme = useTheme()
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
    noSsr: true,
  })
  const itemCount = itemData.length
  const itemSize = smUp ? 36 : 48

  const getChildSize = (child: React.ReactChild) => {
    if (child.hasOwnProperty('group')) {
      return 48
    }

    return itemSize
  }

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0)
  }

  const gridRef = useResetCache(itemCount)

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => 48}
          overscanCount={5}
          itemCount={itemCount}>
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  )
})

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: 'border-box',
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
})

export interface PokeHighlight {
  id: number
  choice: 'pass' | 'smash'
}
