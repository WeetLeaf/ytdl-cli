import ytdl from "@distube/ytdl-core";
import { downloadTrack } from "./download.track";

const ytpl = require("@distube/ytpl");

const BATCH_SIZE = 5;
export const downloadPlaylist = async (listUrl: string) => {
  let firstPage = await ytpl(listUrl);
  const items = firstPage.items;

  console.log(`Downloading playlist with ${items.length} items`);

  // Create batches of 5 videos
  const batchs: (typeof items)[] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batchs.push(items.slice(i, i + BATCH_SIZE));
  }

  // Download each batch
  const allDls: PromiseSettledResult<ytdl.videoInfo>[] = [];
  for (const batch of batchs) {
    const downloads = batch.map((item: any[number]) => {
      return downloadTrack(item.url);
    });

    const dls = await Promise.allSettled(downloads);

    dls.forEach((dl) => {
      if (dl.status === "fulfilled")
        console.log(`✅ ${dl.value.videoDetails.title} downloaded`);
    });

    allDls.push(...dls);

    console.log(items.length - allDls.length, " remaining items to download");
  }

  allDls.forEach((dl) => {
    if (dl.status === "rejected") console.error("❌", dl.reason);
  });
};
