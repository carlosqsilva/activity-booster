import { Show, type Component, type JSX } from "solid-js";
import { defined } from "../../utils";

interface InputRangeProps<T extends string>
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  name: T;
  onChange?: (name: T, value: number) => void;
  label?: JSX.Element;
  helpText?: JSX.Element;
  min: number;
  max: number;
  value: number;
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
        min={props.min}
        max={props.max}
        value={props.value}
        disabled={props.disabled}
        class="range range-success disabled:opacity-15 disabled:cursor-not-allowed"
        onInput={(ev) => props.onChange?.(props.name, Number(ev.target.value))}
      />
      <Show when={defined(props.helpText)}>
        <div class="label">
          <span class="label-text-alt">{props.helpText}</span>
        </div>
      </Show>
    </label>
  );
};
