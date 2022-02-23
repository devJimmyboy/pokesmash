export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
//capitalize all words of a string. 
export function capitalizeWords(string: string) {
  return string.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
};
export const showdownBuilder = (i: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${i}.gif`
export const hdBuilder = (i: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i}.png`