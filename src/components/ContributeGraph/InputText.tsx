import { Show, type Component, type JSX } from "solid-js";
import { defined } from "../../utils";

interface InputTextProps<T extends string> {
  name: T;
  onChange: (name: T, value: string) => void;
  placeHolder?: string;
  label?: JSX.Element;
  helpText?: JSX.Element;
  required?: boolean;
}

export const InputText: Component<InputTextProps<any>> = (props) => {
  return (
    <label class="form-control w-full">
      <Show when={defined(props.label)}>
        <div class="label">
          <span class="label-text">{props.label}</span>
        </div>
      </Show>
      <input
        type="text"
        required={props.required}
        class="input input-bordered w-full"
        placeholder={props.placeHolder}
        name={props.name}
        onInput={(ev) => props.onChange(props.name, ev.target.value)}
      />
      <Show when={defined(props.helpText)}>
        <div class="label">
          <span class="label-text-alt">{props.helpText}</span>
        </div>
      </Show>
    </label>
  );
};
