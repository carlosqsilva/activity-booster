import { createEffect, For, Show } from "solid-js";
import debounce from "debounce";

import {
  store,
  setStore,
  createPoints,
  setPoints,
  points,
  createRepo,
  MESSAGE_COMMITS,
  type CreatePointsCommon,
} from "./state";
import { InputRange } from "./InputRange";
import { InputCheckbox } from "./InputCheckbox";
import { InputText } from "./InputText";
import { createColorRangeFunction } from "./utils";

export function App() {
  return (
    <div class="flex flex-col gap-4">
      <div class="-ml-2">
        <ContributionGraph />
      </div>

      <Form />
    </div>
  );
}

function Form() {
  const debounceUpdate = debounce((options: CreatePointsCommon) => {
    setPoints("data", createPoints(options));
  }, 300);

  createEffect(() => {
    debounceUpdate({
      hasMessage: store.hasMessage,
      message: store.message,
      invertColor: store.invertColor,
      maxCommits: store.maxCommits,
      noWeekends: store.noWeekends,
    });
  });

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    setStore("state", "processing");
    createRepo(points.data, store).finally(() => {
      setStore("state", "idle");
      setStore("progress", 0);
    });
  };

  const isProcessing = () => store.state === "processing";

  return (
    <form class="flex flex-col gap-5" onSubmit={handleSubmit}>
      <InputCheckbox
        label="Write a Custom Message"
        name="hasMessage"
        checked={store.hasMessage}
        onChange={(name, state) => setStore(name, state)}
        disabled={isProcessing()}
      />

      <Show when={store.hasMessage}>
        <InputText
          name="message"
          onChange={(name, value) => setStore(name, value)}
          placeHolder="Write a awesome message!"
          disabled={isProcessing()}
        />
        <div class="flex gap-4">
          <InputCheckbox
            label="Invert Color"
            name="invertColor"
            checked={store.invertColor}
            onChange={(name, state) => setStore(name, state)}
            disabled={isProcessing()}
          />
        </div>
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
        disabled={store.hasMessage || isProcessing()}
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
          disabled={isProcessing()}
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
          disabled={isProcessing()}
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
        disabled={isProcessing()}
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
          class="btn btn-success btn-wide flex-1 relative"
          disabled={isProcessing()}
        >
          <Show when={isProcessing()}>
            <Progress />

            <span class="mix-blend-difference text-lg">
              Creating repository Archive
            </span>
          </Show>

          <Show when={!isProcessing()}>
            <span class="text-lg">Create Activity Repository</span>
          </Show>
        </button>

        <button
          class="btn btn-ghost"
          type="button"
          disabled={store.hasMessage || isProcessing()}
          onClick={() => {
            debounceUpdate(store);
            debounceUpdate.flush();
          }}
        >
          🎲
        </button>
      </div>
    </form>
  );
}

function Progress() {
  return (
    <div class="pointer-events-none rounded-lg absolute inset-0 overflow-hidden">
      <div
        class="absolute rounded-lg inset-0 bg-gray-100 transform-gpu -translate-x-full"
        style={{
          "--tw-translate-x": `-${(1 - store.progress) * 100}%`,
        }}
      />
    </div>
  );
}

function ContributionGraph() {
  let getColor = (_: number): string | null => "#38b000";
  createEffect(() => {
    const maxCommits = store.hasMessage ? MESSAGE_COMMITS : store.maxCommits;
    getColor = createColorRangeFunction(1, maxCommits, [
      "#008000",
      "#38b000",
      "#70e000",
    ]);
  });

  return (
    <div class="grid grid-flow-col grid-rows-7 gap-[2px] font-mono">
      <div />
      <div class="leading-3 text-xs text-right">M</div>
      <div />
      <div class="leading-3 text-xs text-right">W</div>
      <div />
      <div class="leading-3 text-xs text-right">F</div>
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
