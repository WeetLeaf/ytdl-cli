#!/usr/bin/env node

import { redBright } from "chalk";
import { textSync } from "figlet";
import { program } from "commander";
import Conf from "conf";
import { downloadAudio } from "./utils/download";

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

if (!downloadPath) {
  console.info("You must define a path");
  program.outputHelp();
} else {
  downloadAudio(cliArgs.url, downloadPath);
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
