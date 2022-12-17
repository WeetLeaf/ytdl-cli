import ytdl from "ytdl-core";
import ytpl from "ytpl";
import { downloadTrack } from "./download.track";

const BATCH_SIZE = 5;
export const downloadPlaylist = async (listUrl: string) => {
  let firstPage: ytpl.Result = await ytpl(listUrl, { pages: 1 });
  const items: ytpl.Item[] = firstPage.items;
  let nextPage: ytpl.ContinueResult | undefined;

  if (firstPage.continuation) {
    nextPage = await ytpl.continueReq(firstPage.continuation);
    items.push(...nextPage.items);
  }

  while (true) {
    if (!nextPage?.continuation) break;
    nextPage = await ytpl.continueReq(nextPage.continuation);
    items.push(...nextPage.items);
  }

  console.log(`Downloading playlist with ${items.length} items`);

  // Create batches of 5 videos
  const batchs: ytpl.Item[][] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batchs.push(items.slice(i, i + BATCH_SIZE));
  }

  // Download each batch
  const allDls: PromiseSettledResult<ytdl.videoInfo>[] = [];
  for (const batch of batchs) {
    const downloads = batch.map((item) => {
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
