import { UTCDate } from "@date-fns/utc";
import {
  addDays,
  addWeeks,
  differenceInDays,
  endOfWeek,
  startOfWeek,
  subDays,
  isWeekend,
} from "date-fns";
import { createStore } from "solid-js/store";

import { createColorRangeFunction, letterMap } from "./utils";
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

function createEmptyPoints(options: CreatePointsOptions) {
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
        points[offset + position].commits = 10;
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
  repository: string | null;
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
  repository: null,
});

interface Point {
  date: Date;
  commits: number;
}

export const [points, setPoints] = createStore<{ data: Point[] }>({
  data: createPoints(),
});
