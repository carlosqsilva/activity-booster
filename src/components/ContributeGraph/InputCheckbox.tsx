import type { Component, JSX } from "solid-js";

interface InputCheckboxProps<T extends string>
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  name: T;
  checked: boolean;
  label: string;
  onChange: (name: T, state: boolean) => void;
}

export const InputCheckbox: Component<InputCheckboxProps<any>> = (props) => {
  return (
    <div class="form-control">
      <label class="label cursor-pointer gap-4 justify-normal">
        <input
          type="checkbox"
          name={props.name}
          checked={props.checked}
          disabled={props.disabled}
          class="checkbox checkbox-success"
          onChange={(ev) => props.onChange(props.name, ev.target.checked)}
        />
        <span class="label-text text-base">{props.label}</span>
      </label>
    </div>
  );
};
