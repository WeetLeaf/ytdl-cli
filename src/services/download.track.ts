import { join } from "path";
import slugify from "slugify";
import ytdl from "@distube/ytdl-core";
import { config } from "./configuration";
import ffmpeg from "fluent-ffmpeg";

export const downloadTrack = async (url: string): Promise<ytdl.videoInfo> => {
  let metas = await ytdl.getInfo(url);

  const stream = ytdl(url, {
    quality: "highestaudio",
    filter: "audioonly",
  });

  const finalPath = join(
    `${config.download_path}`,
    "/",
    `${slugify(metas.videoDetails.title)}.mp3`
  );
  console.log("🚀 Downloading : ", metas.videoDetails.title);

  return new Promise<ytdl.videoInfo>((res, rej) => {
    ffmpeg(stream)
      .audioBitrate(320)
      .save(finalPath)
      .on("end", () => {
        res(metas);
      })
      .on("error", (err) => {
        rej(`Failed to download ${url}: ${err}`);
      });
  });
};

export const downloadSingle = async (url: URL) => {
  return downloadTrack(url.href)
    .then((res) => {
      console.log(`${res.videoDetails.title} downloaded`);
    })
    .catch((err) => {
      console.error("❌", err);
    });
};
