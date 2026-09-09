"use client";

type ToggleSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  checkedLabel?: string;
  uncheckedLabel?: string;
  disabled?: boolean;
  name?: string;
};

export default function ToggleSwitch({
  checked,
  onCheckedChange,
  label,
  checkedLabel = "On",
  uncheckedLabel = "Off",
  disabled = false,
  name,
}: ToggleSwitchProps) {
  return (
    <div>
      <span className="mb-1 block font-medium">{label}</span>
      <label className="inline-flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="relative h-7 w-12 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
        <span className="text-sm text-slate-700">
          {checked ? checkedLabel : uncheckedLabel}
        </span>
      </label>
    </div>
  );
}
