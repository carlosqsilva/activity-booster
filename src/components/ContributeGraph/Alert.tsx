import type { Component, JSX } from "solid-js";
import { cn } from "../../utils";

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {
  message: JSX.Element;
}

export const Alert: Component<Props> = (props) => {
  return (
    <div role="alert" class={cn("alert", props.class)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-info h-6 w-6 shrink-0"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{props.message}</span>
      {/* <div>
        <button class="btn btn-sm">Deny</button>
        <button class="btn btn-sm btn-primary">Accept</button>
      </div> */}
    </div>
  );
};
