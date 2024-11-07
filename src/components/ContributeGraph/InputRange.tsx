import type { Component, JSX } from "solid-js";
import { defined } from "../../utils";

interface InputRangeProps<T extends string>
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  name: T;
  onChange?: (name: T, value: number) => void;
  label?: JSX.Element;
}

export const InputRange: Component<InputRangeProps<any>> = (props) => {
  return (
    <label class="form-control w-full">
      <Show when={defined(props.label)}>
        <div class="label">
          <span class="label-text text-base">{props.label}</span>
          {/* <span class="label-text-alt">Top Right label</span> */}
        </div>
      </Show>

      <input
        type="range"
        min="1"
        max="30"
        value="10"
        class="range range-success disabled:opacity-15 disabled:cursor-not-allowed"
        disabled={props.disabled}
        onInput={(ev) => props.onChange?.(props.name, Number(ev.target.value))}
      />
    </label>
  );
};
