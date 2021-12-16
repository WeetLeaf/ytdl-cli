import { mkdirSync, existsSync } from "fs";
import ytdl from "ytdl-core";
import { join } from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(ffmpegPath.path);

export const downloadAudio = async (
  url: string,
  path: string,
  onStart?: (metas: ytdl.videoInfo) => void,
  onPogress?: (p: any) => void
) => {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
  const stream = ytdl(url, {
    quality: "highestaudio",
  });
  const start = Date.now();

  const metas = await ytdl.getInfo(url);

  const finalPath = join(`${path}`, "/", `${metas.videoDetails.title}.mp3`);
  onStart?.(metas);

  return new Promise<number>((resolve, reject) => {
    ffmpeg(stream)
      .audioBitrate(320)
      .save(finalPath)
      .on("progress", (p) => {
        onPogress?.(p);
      })
      .on("end", () => {
        resolve((Date.now() - start) / 1000);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};
