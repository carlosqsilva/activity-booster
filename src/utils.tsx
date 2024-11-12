import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function defined<T>(item: T): item is Exclude<T, null | undefined> {
  return item !== undefined && item !== null;
}

export function clampValue(min: number, max: number, value: number) {
  return Math.min(Math.max(value, min), max);
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
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
