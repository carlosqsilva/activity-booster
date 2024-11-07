import { UTCDate } from "@date-fns/utc";
import {
  addDays,
  addWeeks,
  differenceInDays,
  endOfWeek,
  startOfWeek,
  subDays,
} from "date-fns";
import { createStore } from "solid-js/store";
import { randomInt } from "../../utils";
import { isWeekend } from "date-fns/fp";
import { createColorRangeFunction } from "./utils";

interface Options {
  noWeekends: boolean;
  maxCommits: number;
  expandNWeeks: number;
}

function shouldCommit() {
  return Math.random() >= 0.15;
}

export function createPoints(
  options: Options = { maxCommits: 10, noWeekends: false, expandNWeeks: 0 },
) {
  const currentDate = new UTCDate();
  let finalDate = new UTCDate();
  if (options.expandNWeeks > 0) {
    finalDate = endOfWeek(addWeeks(finalDate, options.expandNWeeks));
  }

  const initialDate = startOfWeek(subDays(currentDate, 365));
  const totalLength = differenceInDays(finalDate, initialDate);
  const getColor = createColorRangeFunction(1, options.maxCommits, [
    "#008000",
    "#38b000",
    "#70e000",
  ]);

  const points: Point[] = [];
  for (let amount = 0; amount <= totalLength; amount++) {
    const date = addDays(initialDate, amount);

    let commits = 0;

    if (!(options.noWeekends && isWeekend(date)) && shouldCommit()) {
      commits = randomInt(1, options.maxCommits);
    }

    points.push({
      date,
      commits: commits,
      color: getColor(commits),
    });
  }

  // console

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
  color: string | null;
}

export const [points, setPoints] = createStore<{ data: Point[] }>({
  data: createPoints(),
});
