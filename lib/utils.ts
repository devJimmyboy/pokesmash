import { getDatabase } from 'firebase/database'
import React, { useEffect, useState } from 'react'
import { useLocalStorage } from 'react-use'
import { useSmash } from './SmashContext'
import howler from 'howler'
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

const shinySound = new howler.Howl({
  src: '/sounds/shiny.mp3',
  volume: 0.5,
  preload: true,
})
// const db = getDatabase()

export const usePokemonPicture = (i?: number, calcShiny = false) => {
  // const db = useFirestore()
  // const a =
  const [shinies, setShinies] = useState<number[]>([])

  const { chance, style, currentId } = useSmash()
  useEffect(() => {
    const knownShinies = JSON.parse(localStorage.getItem('pokesmash-shinies') ?? '[]') as number[]
    if (knownShinies.length !== shinies.length) setShinies(knownShinies)
  }, [shinies, i ? i : currentId])

  const [shiny, setShiny] = React.useState(false)
  const [sprite, setSprite] = React.useState(buildUrl('/substitute.png'))
  React.useEffect(() => {
    const id = i || currentId
    const shinyChance = (1 / 850) * 100
    // 100 / 4096
    if (process.env.NODE_ENV === 'development' && calcShiny) console.log('rolling for shiny', id)
    const isShiny = !calcShiny ? shinies?.includes(id) ?? false : shinies?.includes(id) || chance.bool({ likelihood: shinyChance })
    if (isShiny && calcShiny) {
      shinySound.play()
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, currentId, style, chance, shinies])
  return { bgUrl: sprite, shiny }
}

function normalizeName(name: string) {
  name = name.toLowerCase()
  if (name.match(/(-[fm])/)) return name.replace('-', '')
  return name.replace(/-(aria|ordinary|incarnate)/, '')
}
