export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
//capitalize all words of a string. 
export function capitalizeWords(string: string) {
  return string.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
};