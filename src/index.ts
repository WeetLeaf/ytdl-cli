#!/usr/bin/env node

import { redBright } from "chalk";
import { textSync } from "figlet";
import { program } from "commander";
import Conf from "conf";
import { ConfigType } from "./type";
import { mkdirSync, existsSync } from "fs";
import ytdl from "ytdl-core";
import readline from "readline";
import { join } from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(ffmpegPath.path);

const config = new Conf<ConfigType>();

console.log(redBright(textSync("YTDL", { horizontalLayout: "full" })));

program.version("0.1.0").option("-c, --config <url>", "Config path");
program.parse(process.argv);

const options = program.opts();

if (options.config) {
  config.set("download_path", options.config);
}

program.argument("<url>", "Youtube URL").action(async (url) => {
  if (!config.get("download_path")) {
    console.info("You must define a path");
    process.exit(0);
  } else {
    if (!existsSync(config.get("download_path"))) {
      mkdirSync(config.get("download_path"), { recursive: true });
    }
    const stream = ytdl(url, {
      quality: "highestaudio",
    });
    const start = Date.now();

    const metas = await ytdl.getInfo(url);

    const finalPath = join(
      `${config.get("download_path")}`,
      "/",
      `${metas.videoDetails.title}.mp3`
    );
    console.log("Downloading ", metas.videoDetails.title);

    ffmpeg(stream)
      .audioBitrate(320)
      .save(finalPath)
      .on("progress", (p) => {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${p.targetSize}kb downloaded`);
      })
      .on("end", () => {
        console.log(
          `\ndone, thanks - ${(Date.now() - start) / 1000}s\n${finalPath}`
        );
      });
  }
});
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
