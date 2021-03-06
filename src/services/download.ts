import { MultiBar, Presets, SingleBar } from "cli-progress";
import { join } from "path";
import ytdl from "ytdl-core";
import ytpl from "ytpl";
import { config } from "./configuration";

import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import slugify from "slugify";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export const handleDownload = async (cliArgs: CliArgs) => {
  const url = new URL(cliArgs.url);
  const list = url.searchParams.get("list");
  if (list) {
    try {
      await downloadPlaylist(list);
    } catch (error) {
      console.error("Error donloading playlist, fallback to single video");
      await downloadSingle(url);
    }
  } else {
    await downloadSingle(url);
  }
  process.exit(0);
};

export const downloadPlaylist = async (listUrl: string) => {
  const playlist = await ytpl(listUrl);

  const multibar = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_classic
  );
  const items = playlist.items;

  // Create batches of 5 videos
  const batchs = [];
  for (let i = 0; i < items.length; i += 5) {
    batchs.push(items.slice(i, i + 5));
  }

  // Download each batch
  const allDls: PromiseSettledResult<ytdl.videoInfo>[] = [];
  for (const batch of batchs) {
    const downloads = batch.map((item) => {
      const bar = multibar.create(200, 0, {});
      return downloadItem(bar, item.url);
    });

    const dls = await Promise.allSettled(downloads);

    allDls.push(...dls);
  }

  allDls.forEach((dl) => {
    if (dl.status === "rejected") {
      console.error("❌", dl.reason);
    } else {
      console.log(`✅ ${dl.value.videoDetails.title} downloaded`);
    }
  });

  multibar.stop();
  console.log("\n");
};

export const downloadSingle = async (url: URL) => {
  const bar = new SingleBar({});
  bar.start(200, 0);
  return downloadItem(bar, url.href)
    .then((res) => {
      console.log(`\n${res.videoDetails.title} downloaded`);
    })
    .catch((err) => {
      console.error("❌", err);
    });
};

export const downloadItem = async (bar: SingleBar, url: string) => {
  const stream = ytdl(url, {
    quality: "highestaudio",
    filter: "audioonly",
  });

  const metas = await ytdl.getInfo(url);

  const finalPath = join(
    `${config.download_path}`,
    "/",
    `${slugify(metas.videoDetails.title)}.mp3`
  );
  bar.setTotal(parseInt(metas.videoDetails.lengthSeconds));

  return new Promise<ytdl.videoInfo>((res, rej) => {
    ffmpeg(stream)
      .audioBitrate(320)
      .save(finalPath)
      .on("end", () => {
        bar.update(bar.getTotal());
        res(metas);
      })
      .on("progress", () => {
        bar.increment(1);
      })
      .on("error", (err) => {
        bar.stop();
        rej(`Failed to download ${url}`);
        console.error(err);
      });
  });
};
