import {
  createContext,
  Show,
  useContext,
  type ParentComponent,
} from "solid-js";

interface TabsProps {
  name: string;
  onChange: (value: string) => void;
  selected: string;
}

interface ContextValues {
  name: string;
  selected: string;
  onChange: (ev: Event & { target: HTMLInputElement }) => void;
}

const context = createContext<ContextValues>();

export const Tabs: ParentComponent<TabsProps> = (props) => {
  const value = {
    name: props.name,
    selected: props.selected,
    onChange: (ev: Event & { target: HTMLInputElement }) =>
      props.onChange(ev.target.value),
  };

  return (
    <div role="tablist" class="tabs tabs-bordered grid-cols-2">
      <context.Provider value={value}>{props.children}</context.Provider>
    </div>
  );
};

interface TabItemProps {
  label: string;
  value: string;
}

export const TabItem: ParentComponent<TabItemProps> = (props) => {
  const value = useContext(context);

  if (!context) throw new Error("context not defined");

  return (
    <Show when={!!value}>
      <input
        type="radio"
        value={props.value}
        name={value?.name}
        role="tab"
        class="tab"
        aria-label={props.label}
        onChange={value?.onChange}
        checked={props.value === value?.selected}
      />
      <div role="tabpanel" class="tab-content pt-8">
        {props.children}
      </div>
    </Show>
  );
};
