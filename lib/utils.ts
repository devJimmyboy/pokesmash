import React from "react";
import { useSmash } from "./SmashContext";


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
    const shinyChance = 1;
    const isShiny = chance.bool({ likelihood: shinyChance });

    setShiny(isShiny);

    switch (style) {
      case "showdown":
        if (id > 649)
          setSprite(`/sprites/pokemon/custom${shiny ? "/shiny/" : "/"}${id}.png`)
        else
          setSprite(`/sprites/pokemon/versions/generation-v/black-white/animated${shiny ? "/shiny/" : "/"}${id}.gif`)
        break;
      case "hd":
        setSprite(`/sprites/pokemon/other/official-artwork/${id}.png`)
        break;
      case "3d":
        setSprite(`/sprites/pokemon/other/home${shiny ? "/shiny/" : "/"}/${id}.png`)
        break;
      default:
      case "clean":
        if (id <= 649) setSprite(`/sprites/pokemon/other/dream-world/${id}.svg`)
        else
          setSprite(`/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon${shiny ? "/shiny/" : "/"}${id}.png`)
    }
  }, [i, currentId, style, chance, shiny])
  return { bgUrl: sprite, shiny }
}

function normalizeName(name: string) {
  name = name.toLowerCase()
  if (name.match(/(-[fm])/))
    return name.replace("-", "");
  return name.replace(/-(aria|ordinary|incarnate)/, '')
}

