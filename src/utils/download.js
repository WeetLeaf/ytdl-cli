"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAudio = void 0;
const fs_1 = require("fs");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const readline_1 = __importDefault(require("readline"));
const path_1 = require("path");
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
const downloadAudio = (url, path) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_1.existsSync(path)) {
        fs_1.mkdirSync(path, { recursive: true });
    }
    const stream = ytdl_core_1.default(url, {
        quality: "highestaudio",
    });
    const start = Date.now();
    const metas = yield ytdl_core_1.default.getInfo(url);
    const finalPath = path_1.join(`${path}`, "/", `${metas.videoDetails.title}.mp3`);
    console.log("Downloading ", metas.videoDetails.title);
    fluent_ffmpeg_1.default(stream)
        .audioBitrate(320)
        .save(finalPath)
        .on("progress", (p) => {
        readline_1.default.cursorTo(process.stdout, 0);
        process.stdout.write(`${p.targetSize}kb downloaded`);
    })
        .on("end", () => {
        console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s\n${finalPath}`);
    });
});
exports.downloadAudio = downloadAudio;
