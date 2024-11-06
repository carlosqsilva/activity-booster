import { UTCDate } from "@date-fns/utc";
import {
  addDays,
  differenceInDays,
  isBefore,
  startOfWeek,
  subDays,
} from "date-fns";
import { createStore } from "solid-js/store";

export function createPoints() {
  const finalDate = new UTCDate();
  // const finalDate = endOfWeek(currentDate);
  const initialDate = startOfWeek(subDays(finalDate, 365));
  const totalLength = differenceInDays(finalDate, initialDate);
  console.log(totalLength);
  // const dayOfWeek = initialDate.getDay() + 1;
  // initialDate = subDays(currentDate, dayOfWeek);
  const points: Point[] = [];
  for (let amount = 0; amount <= totalLength; amount++) {
    const date = addDays(initialDate, amount);
    points.push({
      date,
      contributions: 0,
      visible: isBefore(date, finalDate),
    });
  }

  return points;
}

interface Point {
  date: Date;
  contributions: number;
  visible: boolean;
}

export type ActivityType = "10xdev" | "custom";

interface Store {
  points: Point[];
  type: ActivityType;
}

export const [store, setStore] = createStore<Store>({
  points: createPoints(),
  type: "10xdev",
});
