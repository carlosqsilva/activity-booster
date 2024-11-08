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
import { randomInt } from "../../utils";

export interface CreatePointsOptions {
  noWeekends: boolean;
  maxCommits: number;
  expandNWeeks?: number;
  hasMessage: boolean;
  message: string;
}

function shouldCommit(dayBefore: boolean, weekBefore: boolean) {
  if (!dayBefore || !weekBefore) return true;
  return Math.random() >= 0.1;
}

export const MESSAGE_COMMITS = 5;

function createEmptyPoints(options: Required<CreatePointsOptions>) {
  const currentDate = new UTCDate();
  const initialDate = startOfWeek(subDays(currentDate, 365));
  let finalDate = new UTCDate();
  if (options.expandNWeeks > 0) {
    finalDate = endOfWeek(addWeeks(finalDate, options.expandNWeeks));
  }
  const totalLength = differenceInDays(finalDate, initialDate);

  const points: Point[] = [];
  for (let amount = 0; amount <= totalLength; amount++) {
    const date = addDays(initialDate, amount);
    points.push({
      date,
      commits: 0,
    });
  }
  return points;
}

export function createPoints(
  options: CreatePointsOptions = {
    maxCommits: 10,
    noWeekends: false,
    expandNWeeks: 0,
    hasMessage: false,
    message: "",
  },
) {
  const points = createEmptyPoints(options);

  if (options.hasMessage) {
    const letters = options.message?.trimEnd().toLowerCase().split("") ?? [];
    if (letters.length === 0) return points;

    let offset = 7;
    for (const letter of letters) {
      const positions = letterMap[letter];

      if (!positions) continue;
      if (positions === "empty") {
        offset += 3 * 7;
        continue;
      }

      for (const position of positions) {
        const newPosition = offset + position;
        if (newPosition > points.length - 1) break;
        points[offset + position].commits = MESSAGE_COMMITS;
      }
      offset += 6 * 7;
    }

    return points;
  }

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

interface Store {
  noWeekends: boolean;
  maxCommits: number;
  userName: string;
  userEmail: string;
  repoUrl: string | null;
  hasMessage: boolean;
  message: string;
}

export const [store, setStore] = createStore<Store>({
  hasMessage: false,
  message: "",
  noWeekends: false,
  maxCommits: 10,
  userName: "",
  userEmail: "",
  repoUrl: null,
});

interface Point {
  date: Date;
  commits: number;
}

export const [points, setPoints] = createStore<{ data: Point[] }>({
  data: createPoints(),
});

export async function createRepo(
  data: Point[],
  info: { repoUrl: string | null; userName: string; userEmail: string },
) {
  // biome-ignore lint/style/useNodejsImportProtocol: <explanation>
  const { Buffer } = await import("buffer");
  window.Buffer = Buffer;

  const git = await import("isomorphic-git");
  const { configureSingle, default: fs } = await import("@zenfs/core");
  const { WebStorage } = await import("@zenfs/dom");

  const dir = "/";
  const file = "README.md";

  sessionStorage.clear();

  await configureSingle({
    backend: WebStorage,
    storage: sessionStorage,
  });

  await git.init({ fs, dir, defaultBranch: "main" });
  if (info.repoUrl) {
    await git.addRemote({ fs, dir, remote: "origin", url: info.repoUrl });
  }

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
        email: info.userEmail,
        name: info.userName,
      },
    });
  };

  for (const point of data) {
    if (point.commits === 0) continue;
    const date = addHours(point.date, 8);
    for (let idx = 0; idx < point.commits; idx++) {
      await contribute(addMinutes(date, idx + 10));
    }
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
  saveAs(blob, "activity-repo.zip");
}

export function saveAs(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);
  const el = document.createElement("a");
  el.href = blobUrl;
  el.download = fileName;

  document.body.appendChild(el);

  el.dispatchEvent(new MouseEvent("click"));

  setTimeout(() => {
    document.body.removeChild(el);
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}
