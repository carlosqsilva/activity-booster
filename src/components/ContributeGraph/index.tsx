import { createEffect, createSignal, For, Show } from "solid-js";
import { produce } from "solid-js/store";
import debounce from "debounce";

import { store, setStore, createPoints, points, setPoints } from "./state";
import { letterMap } from "./utils";
import { InputRange } from "./InputRange";
import { InputCheckbox } from "./InputCheckbox";
import { InputText } from "./InputText";
import { defined } from "../../utils";

export function Form() {
  const handleMessageChange = debounce((value?: string) => {
    const letters = value?.trimEnd().toLowerCase().split("") ?? [];

    if (letters.length === 0) {
      setPoints("data", createPoints());
      return null;
    }

    setPoints(
      "data",
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
            points[offset + position].commits = 30;
          }
          offset += 6 * 7;
        }

        return points;
      }),
    );
  }, 300);

  const updatePoints = debounce(() => {}, 300);

  createEffect(() => {});

  return (
    <div class="flex flex-col gap-4">
      <div class="-ml-8 flex flex-col gap-5">
        <ContributionGraph />

        <InputCheckbox
          label="Write a Custom Message"
          name="hasMessage"
          checked={store.hasMessage}
          onChange={(name, state) => setStore(name, state)}
        />

        <Show when={store.hasMessage}>
          <InputText
            name="message"
            onChange={(_, value) => handleMessageChange(value)}
            placeHolder="Write a awesome message!"
          />
        </Show>

        <InputCheckbox
          label="No Commits on Weekends"
          name="noWeekends"
          disabled={store.hasMessage}
          checked={store.noWeekends}
          onChange={([name, state]) => setStore(name, state)}
        />

        <InputRange
          name="maxCommits"
          disabled={store.hasMessage}
          onChange={(name, value) => setStore(name, value)}
          label={
            <>
              Maximum number of commits per day: <b>{store.maxCommits}</b>
            </>
          }
        />

        <div class="flex gap-4">
          <InputText
            name="userName"
            onChange={(name, value) => setStore(name, value)}
            placeHolder="In doubt run 'git config get user.name'"
            label={
              <>
                Your config <b>user.name</b>
              </>
            }
          />

          <InputText
            name="userEmail"
            onChange={(name, value) => setStore(name, value)}
            placeHolder="In doubt run 'git config get user.email'"
            label={
              <>
                Your config <b>user.email</b>
              </>
            }
          />
        </div>

        <InputText
          name="repository"
          onChange={(name, value) => setStore(name, value)}
          placeHolder="ex: "
          label={
            <>
              Your repository url https or ssh{" "}
              <div class="badge badge-secondary">Optional</div>
            </>
          }
        />

        <button class="btn btn-success" type="button">
          <span class="text-lg">Create Activity Repository</span>
        </button>
      </div>
    </div>
  );
}

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
      <For each={points.data}>
        {(item) => (
          <div class="tooltip" data-tip={item.date}>
            <div
              class="h-[10px] w-[10px] rounded-sm"
              style={{ ...(defined(item.color) && { background: item.color }) }}
              // classList={{
              //   "bg-gray-500/50": item.commits === 0,
              //   "bg-green-500/30": item.commits > 0 && item.commits <= 5,
              //   "bg-green-500/50": item.commits > 5 && item.commits <= 10,
              //   "bg-green-500/60": item.commits > 10 && item.commits <= 15,
              //   "bg-green-500/70": item.commits > 15 && item.commits <= 20,
              //   "bg-[#70e000]": item.commits > 20 && item.commits <= 30,
              // }}
            />
          </div>
        )}
      </For>
    </div>
  );
}
