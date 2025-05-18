import { Command } from "commander";
import Conf from "conf";
import { existsSync, mkdirSync } from "fs";
import packageJson from "../../package.json";

export const conf = new Conf<ConfigType>({ projectName: packageJson.name });

export const handleConfiguration = (options: CliOpts, program: Command) => {
  if (options.config) {
    conf.set("download_path", options.config);
  }

  const downloadPath = conf.get("download_path");

  if (!downloadPath) {
    console.info("You must define a path using the --config option");
    program.outputHelp();
    process.exit(1);
  }

  if (!existsSync(downloadPath)) {
    mkdirSync(downloadPath, { recursive: true });
  }

  return { downloadPath };
};

export const config = {
  download_path: conf.get("download_path"),
};
