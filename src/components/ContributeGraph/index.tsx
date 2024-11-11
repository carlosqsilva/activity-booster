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
  MIN_COMMITS,
  MAX_COMMITS,
} from "./state";
import { InputRange } from "./InputRange";
import { InputCheckbox } from "./InputCheckbox";
import { InputText } from "./InputText";
import { createColorRangeFunction } from "./utils";
import { format } from "date-fns";

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
      hasCustom: store.hasCustom,
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
    <form class="flex flex-col gap-5 px-2 md:px-0" onSubmit={handleSubmit}>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <InputCheckbox
          label="Write message"
          name="hasMessage"
          checked={store.hasMessage}
          onChange={(name, state) => {
            if (state) setStore(name, state);
            else setStore({ hasMessage: state, invertColor: false });
          }}
          disabled={store.hasCustom || isProcessing()}
        />

        <InputCheckbox
          label="Paint graph"
          name="hasCustom"
          checked={store.hasCustom}
          disabled={store.hasMessage || isProcessing()}
          onChange={(name, state) => setStore(name, state)}
        />

        <InputCheckbox
          label="No Commits on Weekends"
          name="noWeekends"
          checked={store.noWeekends}
          disabled={store.hasMessage || store.hasCustom || isProcessing()}
          onChange={(name, state) => setStore(name, state)}
        />
      </div>

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

      <InputRange
        min={MIN_COMMITS}
        max={MAX_COMMITS}
        value={store.maxCommits}
        name="maxCommits"
        disabled={store.hasMessage || store.hasCustom || isProcessing()}
        onChange={(name, value) => setStore(name, value)}
        label={
          <>
            Maximum number of commits per day: <b>{store.maxCommits}</b>
          </>
        }
        helpText={<>☝️High values takes longer export</>}
      />

      <div class="flex flex-col md:flex-row gap-4">
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

      {/* <InputText
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
      /> */}

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
          disabled={store.hasMessage || store.hasCustom || isProcessing()}
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
  let getColor = ((_) => "#38b000") as ReturnType<
    typeof createColorRangeFunction
  >;

  createEffect(() => {
    let maxCommits = store.maxCommits;
    if (store.hasMessage) maxCommits = MESSAGE_COMMITS;
    if (store.hasCustom) maxCommits = MAX_COMMITS;
    getColor = createColorRangeFunction(1, maxCommits, [
      "#008000",
      "#38b000",
      "#70e000",
    ]);
  });

  const handleClick = (idx: number) => {
    if (!store.hasCustom) return;
    setPoints("data", idx, "commits", (commit) => {
      const value = commit + MESSAGE_COMMITS;
      return Math.min(Math.max(value, MIN_COMMITS), MAX_COMMITS);
    });
  };

  return (
    <>
      <div class="grid grid-flow-col grid-rows-7 gap-[2px] font-mono relative">
        <Show when={store.hasCustom}>
          <div class="animate-pulse text-center absolute text-sm right-0 left-0 -top-5">
            Click on the graph
          </div>
        </Show>

        <div />
        <div class="leading-3 text-xs text-right">M</div>
        <div />
        <div class="leading-3 text-xs text-right">W</div>
        <div />
        <div class="leading-3 text-xs text-right">F</div>
        <div />
        <For each={points.data}>
          {(item, index) => (
            <div
              class="tooltip"
              data-tip={
                item.commits === 0
                  ? `No contributions on ${format(item.date, "MMMM do")}.`
                  : `${item.commits} contributions on ${format(item.date, "MMMM do")}.`
              }
            >
              <div
                onClick={[handleClick, index()]}
                onKeyPress={[handleClick, index]}
                class="h-[10px] w-[10px] rounded-sm bg-gray-200/20"
                style={{ background: getColor(item.commits) }}
              />
            </div>
          )}
        </For>
      </div>
    </>
  );
}
