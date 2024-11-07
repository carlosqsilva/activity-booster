import { createEffect, For, Show } from "solid-js";
import debounce from "debounce";

import {
  store,
  setStore,
  createPoints,
  setPoints,
  points,
  type CreatePointsOptions,
} from "./state";
import { InputRange } from "./InputRange";
import { InputCheckbox } from "./InputCheckbox";
import { InputText } from "./InputText";
import { createColorRangeFunction } from "./utils";

export function Form() {
  const debounceUpdate = debounce((options: CreatePointsOptions) => {
    setPoints("data", createPoints(options));
  }, 300);

  createEffect(() => {
    debounceUpdate({
      maxCommits: store.maxCommits,
      hasMessage: store.hasMessage,
      message: store.message,
      noWeekends: store.noWeekends,
    });
  });

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
            onChange={(name, value) => setStore(name, value)}
            placeHolder="Write a awesome message!"
          />
        </Show>

        <InputCheckbox
          label="No Commits on Weekends"
          name="noWeekends"
          disabled={store.hasMessage}
          checked={store.noWeekends}
          onChange={(name, state) => setStore(name, state)}
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
          placeHolder="ex: git@github.com:<USERNAME>/<REPO>.git"
          label={
            <>
              Your repository url https or ssh{" "}
              <div class="badge badge-secondary">Optional</div>
            </>
          }
        />

        <div class="flex gap-4">
          <button class="btn btn-success flex-1" type="button">
            <span class="text-lg">Create Activity Repository</span>
          </button>

          <button
            class="btn btn-ghost"
            type="button"
            onClick={() => {
              debounceUpdate(store);
              debounceUpdate.flush();
            }}
          >
            🎲
          </button>
        </div>
      </div>
    </div>
  );
}

function ContributionGraph() {
  let getColor = (_: number): string | null => null;
  createEffect(() => {
    const maxCommits = store.hasMessage ? 10 : store.maxCommits;
    getColor = createColorRangeFunction(1, maxCommits, [
      "#008000",
      "#38b000",
      "#70e000",
    ]);
  });

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
              class="h-[10px] w-[10px] rounded-sm bg-gray-200/20"
              style={{ background: getColor(item.commits) ?? undefined }}
            />
          </div>
        )}
      </For>
    </div>
  );
}
