import fs from "fs/promises";
import path from "path";
import { MainClient, NamedAPIResourceList, PokemonHabitat } from "pokenode-ts";

const client = new MainClient();
const dataPath = path.join(process.cwd(), "public", "data/env.json")

async function main() {

  const envBgs = await fs.readdir(path.join(process.cwd(), "public", "backgrounds")).then(files => {
    return files.filter(file => file.endsWith(".png")).map((v) => {
      let img = v.replace(".png", "");
      img = v.replace("bg-", "")
      return img;
    });
  });
  const defaultBg = `/public/backgrounds/bg-beach.png`;
  const bgsPerPokemon: { [id: number]: string } = {

  }
  for (let i = 868; i > 0; i--) {
    client.pokemon.getPokemonById(i).then(pokemon => {
      client.pokemon.getPokemonSpeciesByName(pokemon.species.name).then(species => {
        species.
        let bg = defaultBg;
        for (const envBg of envBgs) {
          if (habitat.name.includes(bg)) {
            bg = `/public/backgrounds/bg-${envBg}.png`;
          }
        }

        bgsPerPokemon[i] = bg;
      }).catch((err) => {
        console.log(err);
      })
    })
  }


  fs.writeFile(dataPath, JSON.stringify(bgsPerPokemon)).then(() => {
    console.log(`file ${dataPath} written`)
  })




}

main().then(() => console.log("Done"));