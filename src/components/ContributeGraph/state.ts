import { UTCDate } from "@date-fns/utc";
import {
  addDays,
  addWeeks,
  differenceInDays,
  endOfWeek,
  startOfWeek,
  subDays,
  isWeekend,
  format,
  addHours,
  addMinutes,
} from "date-fns";
import { createStore } from "solid-js/store";

import { letterMap } from "./utils";
import { defined, randomInt, saveAs } from "../../utils";

export interface CreatePointsCommon {
  hasMessage: boolean;
  noWeekends: boolean;
  invertColor: boolean;
  hasCustom: boolean;
  maxCommits: number;
  expandNWeeks?: number;
  message: string;
}

export interface RepoConfig {
  userName: string;
  userEmail: string;
  // repoUrl: string | null;
}

export type StateType = "idle" | "processing";

interface Store extends CreatePointsCommon, RepoConfig {
  state: StateType;
  progress: number;
}

const initialState = ((): Store => ({
  hasMessage: false,
  invertColor: false,
  noWeekends: false,
  hasCustom: false,
  maxCommits: 10,
  message: "",
  userName: "",
  userEmail: "",
  // repoUrl: null,
  state: "idle",
  progress: 0,
}))();

export const [store, setStore] = createStore<Store>(initialState);

export interface Point {
  date: Date;
  commits: number;
}

export const [points, setPoints] = createStore<{ data: Point[] }>({
  data: createPoints(),
});

function shouldCommit(dayBefore: boolean, weekBefore: boolean) {
  if (!dayBefore || !weekBefore) return true;
  return Math.random() >= 0.1;
}

export const MESSAGE_COMMITS = 5;
export const MIN_COMMITS = 1;
export const MAX_COMMITS = 30;

function createEmptyPoints(options: CreatePointsCommon) {
  const currentDate = new UTCDate();
  const initialDate = startOfWeek(subDays(currentDate, 365));
  let finalDate = new UTCDate();
  if (defined(options.expandNWeeks) && options.expandNWeeks > 0) {
    finalDate = endOfWeek(addWeeks(finalDate, options.expandNWeeks));
  }
  const totalLength = differenceInDays(finalDate, initialDate);

  const points: Point[] = [];
  for (let amount = 0; amount <= totalLength; amount++) {
    const date = addDays(initialDate, amount);
    points.push({
      date,
      commits: options.invertColor ? MESSAGE_COMMITS : 0,
    });
  }
  return points;
}

function writeMessage(points: Point[], options: CreatePointsCommon) {
  const letters = options.message.trimEnd().toLowerCase().split("") ?? [];
  if (letters.length === 0) return points;

  let offset = 7;
  for (const letter of letters) {
    const positions = letterMap[letter];

    if (!positions) continue;
    if (positions === "empty") {
      offset += 2 * 7;
      continue;
    }

    for (const position of positions) {
      const newPosition = offset + position;
      if (newPosition > points.length - 1) break;
      points[offset + position].commits = options.invertColor
        ? 0
        : MESSAGE_COMMITS;
    }
    offset += 6 * 7;
  }

  return points;
}

function randomizeValues(points: Point[], options: CreatePointsCommon) {
  let shouldCommitToday = true;
  for (let index = 0; index < points.length; index++) {
    shouldCommitToday = shouldCommit(
      shouldCommitToday,
      // has commited the same day on previous week,
      index > 7 && points[index - 7].commits > 0,
    );

    if (
      !(isWeekend(points[index].date) && options.noWeekends) &&
      shouldCommitToday
    ) {
      points[index].commits = randomInt(1, options.maxCommits);
    }
  }

  return points;
}

export function createPoints(options: CreatePointsCommon = initialState) {
  const points = createEmptyPoints(options);

  if (options.hasCustom) {
    return points;
  }

  if (options.hasMessage) {
    return writeMessage(points, options);
  }

  return randomizeValues(points, options);
}

export async function createRepo(data: Point[], config: RepoConfig) {
  // biome-ignore lint/style/useNodejsImportProtocol: <explanation>
  const { Buffer } = await import("buffer");
  window.Buffer = Buffer;

  const git = await import("isomorphic-git");
  const { configureSingle, default: fs } = await import("@zenfs/core");
  const { WebStorage } = await import("@zenfs/dom");

  sessionStorage.clear();

  await configureSingle({
    backend: WebStorage,
    storage: sessionStorage,
  });

  const dir = "/";
  const file = "README.md";

  performance.mark("start");

  await git.init({ fs, dir, defaultBranch: "main" });
  // if (config.repoUrl) {
  //   await git.addRemote({ fs, dir, remote: "origin", url: config.repoUrl });
  // }

  let content = ".";
  const contribute = async (date: Date) => {
    content = content === "" ? "." : "";
    fs.writeFile(file, content);
    const timestamp = Math.floor(new UTCDate(date).getTime() / 1000);
    await git.add({ fs, dir, filepath: file });
    await git.commit({
      fs,
      dir,
      message: `ref: ${format(date, "yyyy-MM-dd HH:mm:ss")}`,
      author: {
        timestamp,
        timezoneOffset: 0,
        email: config.userEmail,
        name: config.userName,
      },
    });
  };

  const total = data.length;
  for (let idx = 0; idx < total; idx++) {
    if (data[idx].commits === 0) continue;

    const point = data[idx];
    const date = addHours(point.date, 8);
    // const date = addHours(point.date, 8);
    for (let idx = 0; idx < point.commits; idx++) {
      await contribute(addMinutes(date, idx + 10));
    }

    setStore("progress", idx / total);
  }

  const { BlobWriter, ZipWriter, Data64URIReader } = await import(
    "@zip.js/zip.js"
  );

  const zipWriter = new ZipWriter(new BlobWriter("appication/zip"));
  const filePaths = await fs.promises.readdir(dir, { recursive: true });
  for (const filePath of filePaths) {
    const stats = await fs.promises.stat(filePath);
    if (stats.isDirectory()) continue;

    const content = await fs.promises.readFile(filePath, "base64");
    const filereader = new Data64URIReader(content);
    zipWriter.add(filePath, filereader);
  }

  const blob = await zipWriter.close();

  performance.mark("end");
  console.log(performance.measure("duration", "start", "end"));

  saveAs(blob, "activity-repo.zip");
}
