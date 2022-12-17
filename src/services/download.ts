import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { downloadPlaylist } from "./download.playlist";
import { downloadSingle } from "./download.track";

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
