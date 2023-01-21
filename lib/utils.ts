import { getDatabase } from 'firebase/database'
import React from 'react'
import { useLocalStorage } from 'react-use'
import { useSmash } from './SmashContext'
const buildUrl = (path: string) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${path}`

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
//capitalize all words of a string.
export function capitalizeWords(string: string) {
  return string.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase()
  })
}

// const db = getDatabase()

export const usePokemonPicture = (i?: number, calcShiny = false) => {
  // const db = useFirestore()
  // const a =
  const [shinies, setShinies] = useLocalStorage<number[]>('pokesmash-shinies', [])
  const { chance, style, currentId } = useSmash()

  const [shiny, setShiny] = React.useState(false)
  const [sprite, setSprite] = React.useState(buildUrl('/substitute.png'))
  React.useEffect(() => {
    const id = i || currentId
    const shinyChance = (1 / 850) * 100
    // 100 / 4096
    const isShiny = !calcShiny ? shinies?.includes(id) ?? false : shinies?.includes(id) || chance.bool({ likelihood: shinyChance })

    setShiny(isShiny)
    if (isShiny && !shinies?.includes(id)) {
      setShinies((s) => (!s ? [id] : [...s, id]))
    }
    if (id > 905) {
      setSprite(`/sprites/${id}${isShiny ? '-shiny' : ''}.png`)
      // setSprite(`https://www.dragonflycave.com/sprites/gen9/unified/${isShiny ? 'shiny/' : ''}${id}.png`)
    } else
      switch (style) {
        case 'showdown':
          if (id > 649) setSprite(buildUrl(`${isShiny ? '/shiny/' : '/'}${id}.png`))
          else setSprite(buildUrl(`/versions/generation-v/black-white/animated${isShiny ? '/shiny/' : '/'}${id}.gif`))
          break
        case 'hd':
          setSprite(buildUrl(`/other/official-artwork/${id}.png`))
          break
        case '3d':
          setSprite(buildUrl(`/other/home${isShiny ? '/shiny/' : '/'}/${id}.png`))
          break
        default:
        case 'clean':
          if (id <= 649) setSprite(buildUrl(`/other/dream-world/${id}.svg`))
          else setSprite(buildUrl(`/${id}.png`))
      }
  }, [i, currentId, style, chance])
  return { bgUrl: sprite, shiny }
}

function normalizeName(name: string) {
  name = name.toLowerCase()
  if (name.match(/(-[fm])/)) return name.replace('-', '')
  return name.replace(/-(aria|ordinary|incarnate)/, '')
}
