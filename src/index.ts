#!/usr/bin/env node

import { program } from "commander";
import figlet from "figlet";
import { handleConfiguration } from "./services/configuration";
import { handleDownload } from "./services/download";
import packageJon from "../package.json"

const cliArgs: CliArgs = {
  url: "",
};

console.log(figlet.textSync("YTDL", { horizontalLayout: "full" }));

program
  .version(packageJon.version)
  .argument("<url>", "Youtube URL")
  .action((url: string) => {
    cliArgs.url = url;
  })
  .option("-c, --config <url>", "Config path")
  .parse(process.argv);

const options = program.opts<CliOpts>();

(async () => {
  handleConfiguration(options, program);

  await handleDownload(cliArgs);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
})();
