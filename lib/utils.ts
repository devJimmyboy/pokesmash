import React from "react";
import { useSmash } from "./SmashContext";
const buildUrl = (path: string) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${path}`

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
//capitalize all words of a string. 
export function capitalizeWords(string: string) {
  return string.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
};

export const usePokemonPicture = (i?: number) => {

  const { chance, style, currentId, pokeInfo } = useSmash()

  const [shiny, setShiny] = React.useState(false);
  const [sprite, setSprite] = React.useState("/sprites/pokemon/substitute.png");
  React.useEffect(() => {

    const id = i || currentId;
    const shinyChance = 100 / 4096;
    const isShiny = chance.bool({ likelihood: shinyChance });

    setShiny(isShiny);

    switch (style) {
      case "showdown":
        if (id > 649)
          setSprite(buildUrl(`${shiny ? "/shiny/" : "/"}${id}.png`))
        else
          setSprite(buildUrl(`/versions/generation-v/black-white/animated${shiny ? "/shiny/" : "/"}${id}.gif`))
        break;
      case "hd":
        setSprite(buildUrl(`/other/official-artwork/${id}.png`))
        break;
      case "3d":
        setSprite(buildUrl(`/other/home${shiny ? "/shiny/" : "/"}/${id}.png`))
        break;
      default:
      case "clean":
        if (id <= 649) setSprite(buildUrl(`/other/dream-world/${id}.svg`))
        else
          setSprite(buildUrl(`/${id}.png`))
    }
  }, [i, currentId, style, chance])
  return { bgUrl: sprite, shiny }
}

function normalizeName(name: string) {
  name = name.toLowerCase()
  if (name.match(/(-[fm])/))
    return name.replace("-", "");
  return name.replace(/-(aria|ordinary|incarnate)/, '')
}

