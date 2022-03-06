import fs from "fs/promises";
import https from 'https';
import path from "path";
import tar from 'tar';
import Listr, { ListrContext, ListrTaskWrapper } from "listr";
import chalk from "chalk";
import throttle from 'lodash.throttle';
import { createWriteStream } from "fs";

const spritesTarDL = "https://codeload.github.com/PokeAPI/sprites/tar.gz/refs/tags/2.0.0"

const tasks = new Listr([{ title: `Reading current sprites dir`, task: readDir }, { "title": "Downloading latest release...", task: downloadTar }, { title: `Cloning sprites from ${chalk.bgGray.white("\uf09b PokeAPI/sprites")}...`, task: cloneSprites }]);

const outDir = path.join(__dirname, '../public/sprites/pokemon');
async function readDir(ctx: ListrContext, task: ListrTaskWrapper) {

  const filesInDir = await fs.readdir(outDir)

  if (filesInDir.length > 1) {
    task.title = `${chalk.bgRed.white('\uf071')} ${chalk.red('Sprites already cloned!')}`
    process.exit(0)
  }

}

const throttledLog = throttle((task: ListrTaskWrapper, output: string) => {
  task.output = output;
}, 1000)

const tarPath = path.join(outDir, 'sprites.tar.gz')
let dataDownloaded = 0;
let dataToDownload = 227909000;
async function downloadTar(ctx: ListrContext, task: ListrTaskWrapper) {
  return new Promise((resolve, reject) => {



    const tarFile = createWriteStream(tarPath);
    https.get(spritesTarDL, response => {
      response.pipe(tarFile);
      response.on("data", (chunk) => {
        dataDownloaded += chunk.length
        throttledLog(task, chalk.bgBlue.white(`\uf09b Downloading ${dataDownloaded}/${dataToDownload} ${chalk.greenBright(`(${((dataDownloaded / dataToDownload) * 100).toPrecision(4)}%)`)} bytes`))
      })
      response.on("end", () => {
        if (response.statusCode === 200) {
          resolve("Finished Downloading")
        } else reject(response.statusMessage || "Unknown error")
      })
    })
  })

}


async function cloneSprites(ctx: ListrContext, task: ListrTaskWrapper) {
  await tar.x({ cwd: outDir, file: tarPath }, ["sprites-2.0.0/sprites/pokemon"]).then(() => { task.output = chalk.bgGreen.white(`\uf00c ${chalk.green('Sprites cloned')}`) }).catch(err => { task.output = chalk.bgRed.white(`\uf071 ${err}`) })
  await fs.rm(tarPath)
  const dirPath = path.join(outDir, 'sprites-2.0.0/sprites/pokemon')
  const filesInPath = await fs.readdir(dirPath);
  const promises = filesInPath.map(async (file) => {
    const inPath = path.join(dirPath, file)
    const outPath = path.join(outDir, file)
    await fs.rename(inPath, outPath).then(() => { throttledLog(task, chalk.bgGreen.white(`\uf00c ${chalk.green(file.endsWith(".png") ? `Sprite ${file} cloned` : `Folder ${file} cloned`)}`)) }).catch(err => { throttledLog(task, chalk.bgRed.white(`\uf071 ${err}`)) })
  })
  await Promise.all(promises)
  await fs.rmdir(path.join(outDir, 'sprites-2.0.0'), { recursive: true, })
  return "All Done :)"

}

tasks.run().catch(err => {
  console.error(err);
  process.exit(1);
})