import { mkdirSync, existsSync } from "fs";
import ytdl from "ytdl-core";
import readline from "readline";
import { join } from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(ffmpegPath.path);

export const downloadAudio = async (url: string, path: string) => {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
  const stream = ytdl(url, {
    quality: "highestaudio",
  });
  const start = Date.now();

  const metas = await ytdl.getInfo(url);

  const finalPath = join(`${path}`, "/", `${metas.videoDetails.title}.mp3`);
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
};
