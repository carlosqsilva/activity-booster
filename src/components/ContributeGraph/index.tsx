import { createEffect, createSignal, For, Show } from "solid-js";
import debounce from "debounce";

import {
  store,
  setStore,
  createPoints,
  setPoints,
  points,
  type CreatePointsOptions,
  createRepo,
  MESSAGE_COMMITS,
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

  const [loading, setLoading] = createSignal(false);
  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    setLoading(true);
    createRepo(points.data, store).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div class="flex flex-col gap-4">
      <div class="-ml-8">
        <ContributionGraph />
      </div>

      <form class="flex flex-col gap-5" onSubmit={handleSubmit}>
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
          helpText={<>☝️High values takes longer export</>}
        />

        <div class="flex gap-4">
          <InputText
            required
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
            required
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
              Your repository URL{" "}
              <div class="badge badge-secondary">Optional</div>
            </>
          }
        />

        <div class="flex gap-4">
          <button
            type="submit"
            class="btn btn-success btn-wide flex-1"
            disabled={loading()}
          >
            <Show when={loading()}>
              <span class="loading loading-spinner" />
              Creating repository Archive
            </Show>
            <Show when={!loading()}>
              <span class="text-lg">Create Activity Repository</span>
            </Show>
          </button>

          <button
            class="btn btn-ghost"
            type="button"
            disabled={store.hasMessage}
            onClick={() => {
              debounceUpdate(store);
              debounceUpdate.flush();
            }}
          >
            🎲
          </button>
        </div>
      </form>
    </div>
  );
}

function ContributionGraph() {
  let getColor = (_: number): string | null => null;
  createEffect(() => {
    const maxCommits = store.hasMessage ? MESSAGE_COMMITS : store.maxCommits;
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
