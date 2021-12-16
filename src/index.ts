#!/usr/bin/env node

import { redBright } from "chalk";
import { textSync } from "figlet";
import { program } from "commander";
import Conf from "conf";
import { downloadAudio } from "./utils/download";
import ytpl from "ytpl";
import readline from "readline";

const config = new Conf<ConfigType>();

const cliArgs: CliArgs = {
  url: "",
};

console.log(redBright(textSync("YTDL", { horizontalLayout: "full" })));

program
  .version("0.1.0")
  .argument("<url>", "Youtube URL")
  .action((url) => (cliArgs.url = url))
  .option("-c, --config <url>", "Config path")
  .parse(process.argv);

const options = program.opts<CliOpts>();

if (options.config) {
  config.set("download_path", options.config);
}

const downloadPath = config.get("download_path");

const processDownload = async () => {
  if (!downloadPath) {
    console.info("You must define a path");
    program.outputHelp();
    return;
  }

  const url = new URL(cliArgs.url);
  const list = url.searchParams.get("list");
  if (!list) {
    const time = await downloadAudio(
      cliArgs.url,
      downloadPath,
      (metas) => {
        console.log("Downloading ", metas.videoDetails.title);
      },
      (p) => {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${p.targetSize}kb downloaded\n`);
      }
    );
    console.log(`Downloaded in ${time} seconds`);

    return;
  }
  const playlist = await ytpl(list);
  const playlistLenght = playlist.items.length;
  let downloadedItems = 0;
  let failedDownloads: string[] = [];

  console.log(`Downloading ${playlistLenght} videos`);
  await Promise.all(
    playlist.items.map(async (item) => {
      try {
        await downloadAudio(item.url, downloadPath);
        downloadedItems++;
      } catch (error) {
        failedDownloads.push(item.title.concat(" - ", item.url));
      }

      console.log(
        `${downloadedItems}/${playlistLenght} ${item.title} downloaded`
      );
    })
  );
  console.log(`\n\n${failedDownloads.length} items failed to download`);
  console.log(failedDownloads.join("\n"));
};

processDownload();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
