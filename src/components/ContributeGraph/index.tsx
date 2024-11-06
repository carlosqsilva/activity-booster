import { For, Show } from "solid-js";
import { produce } from "solid-js/store";
import debounce from "debounce";

import { store, setStore, createPoints, type ActivityType } from "./state";
import { Tabs, TabItem } from "./Tabs";

const letterMap: Record<string, number[] | "empty"> = {
  a: [1, 2, 3, 4, 5, 6, 7, 10, 14, 17, 21, 24, 29, 30, 31, 32, 33, 34],
  b: [0, 1, 2, 3, 4, 5, 6, 7, 10, 13, 14, 17, 20, 21, 24, 27, 29, 30, 32, 33],
  c: [1, 2, 3, 4, 5, 7, 13, 14, 20, 21, 27, 29, 33],
  d: [0, 1, 2, 3, 4, 5, 6, 7, 13, 14, 20, 21, 27, 29, 30, 31, 32, 33],
  e: [0, 1, 2, 3, 4, 5, 6, 7, 10, 13, 14, 17, 20, 21, 24, 27, 28, 34],
  f: [0, 1, 2, 3, 4, 5, 6, 7, 10, 14, 17, 21, 24, 28],
  g: [1, 2, 3, 4, 5, 7, 13, 14, 17, 20, 21, 24, 27, 29, 31, 32, 33],
  h: [0, 1, 2, 3, 4, 5, 6, 10, 17, 24, 28, 29, 30, 31, 32, 33, 34],
  i: [7, 13, 14, 15, 16, 17, 18, 19, 20, 21, 27],
  j: [5, 7, 13, 14, 20, 21, 27, 28, 29, 30, 31, 32, 33],
  k: [0, 1, 2, 3, 4, 5, 6, 10, 17, 23, 25, 28, 29, 33, 34],
  l: [0, 1, 2, 3, 4, 5, 6, 13, 20, 27, 34],
  m: [0, 1, 2, 3, 4, 5, 6, 8, 16, 22, 28, 29, 30, 31, 32, 33, 34],
  n: [0, 1, 2, 3, 4, 5, 6, 9, 17, 25, 28, 29, 30, 31, 32, 33, 34],
  o: [1, 2, 3, 4, 5, 7, 13, 14, 20, 21, 27, 29, 30, 31, 32, 33],
  p: [0, 1, 2, 3, 4, 5, 6, 7, 10, 14, 17, 21, 24, 29, 30],
  q: [1, 2, 3, 4, 5, 7, 13, 14, 18, 20, 21, 26, 27, 29, 30, 31, 32, 33, 34],
  r: [0, 1, 2, 3, 4, 5, 6, 7, 10, 14, 17, 21, 24, 29, 30, 32, 33, 34],
  s: [1, 2, 5, 7, 10, 13, 14, 17, 20, 21, 24, 27, 29, 32, 33],
  t: [0, 7, 14, 15, 16, 17, 18, 19, 20, 21, 28],
  u: [0, 1, 2, 3, 4, 5, 13, 20, 27, 28, 29, 30, 31, 32, 33],
  v: [0, 1, 2, 3, 4, 12, 20, 26, 28, 29, 30, 31, 32],
  w: [0, 1, 2, 3, 4, 5, 6, 12, 18, 26, 28, 29, 30, 31, 32, 33, 34],
  x: [0, 1, 5, 6, 9, 11, 17, 23, 25, 28, 29, 33, 34],
  y: [0, 1, 9, 17, 18, 19, 20, 23, 28, 29],
  z: [0, 5, 6, 7, 11, 13, 14, 17, 20, 21, 23, 27, 28, 29, 34],
  "!": [21, 22, 23, 24, 25, 27],
  "?": [1, 7, 14, 18, 20, 21, 24, 29, 30],
  "-": [10, 17, 24],
  ">": [0, 6, 8, 12, 16, 18, 24],
  "<": [10, 16, 18, 22, 26, 28, 34],
  _: [6, 13, 20, 27, 34],
  " ": "empty",
};

function ContributionGraph() {
  return (
    <div class="grid grid-flow-col grid-rows-7 gap-[2px]">
      <div />
      <div class="leading-3 text-sm text-right">Mon</div>
      <div />
      <div />
      <div />
      <div class="leading-3 text-sm text-right">Fri</div>
      <div />
      <For each={store.points}>
        {(item) => (
          <Show when={item.visible}>
            <div class="tooltip" data-tip={item.date}>
              <div
                class="h-[10px] w-[10px] rounded-sm"
                classList={{
                  "bg-gray-300": item.contributions === 0,
                  "bg-[#84cc16]": item.contributions === 1,
                  "bg-[#65a30d]": item.contributions === 2,
                  "bg-[#4d7c0f]": item.contributions === 3,
                  "bg-[#3f6212]": item.contributions === 4,
                }}
              />
            </div>
          </Show>
        )}
      </For>
    </div>
  );
}

export function Form() {
  const handleInput = debounce(
    (ev: InputEvent & { target: HTMLInputElement }) => {
      const letters = ev.target?.value?.trim().toLowerCase().split("") ?? [];

      if (letters.length === 0) {
        setStore("points", createPoints());
        return null;
      }

      setStore(
        "points",
        produce((points) => {
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
              points[offset + position].contributions = 4;
            }
            offset += 6 * 7;
          }

          return points;
        }),
      );
    },
    500,
  );

  return (
    <div class="flex flex-col gap-4">
      <div class="-ml-8">
        <ContributionGraph />
      </div>

      <Tabs
        name="graphtype"
        onChange={(value) => {
          console.log({ type: value });
          setStore("type", value as ActivityType);
        }}
      >
        <TabItem label="10x chad developer" value="10xdev">
          <input
            type="range"
            min="0"
            max="100"
            value="40"
            class="range range-success "
          />
        </TabItem>

        <TabItem label="I want to Write something cool" value="custom">
          <label class="input input-bordered flex items-center gap-2">
            <input
              type="text"
              class="grow"
              placeholder="Write something cool!"
              onInput={handleInput}
            />
          </label>
        </TabItem>
      </Tabs>
    </div>
  );
}
