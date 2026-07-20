import { cn } from "@/lib/utils";
import {
  EFFORT_OPTIONS,
  type EffortMinutes,
} from "@/lib/effort-options";

type EffortSelectorProps = {
  name: string;
  value: EffortMinutes | null;
  onChange: (value: EffortMinutes) => void;
  disabled?: boolean;
  legend?: string;
};

export function EffortSelector({
  name,
  value,
  onChange,
  disabled = false,
  legend = "Time effort",
}: EffortSelectorProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup">
        {EFFORT_OPTIONS.map((option) => {
          const selected = value === option.minutes;
          return (
            <label key={option.minutes} className="cursor-pointer">
              <input
                type="radio"
                className="peer sr-only"
                name={name}
                value={option.minutes}
                checked={selected}
                onChange={() => onChange(option.minutes)}
              />
              <span
                className={cn(
                  "flex min-h-11 items-center justify-center rounded-lg border px-2 py-1.5 text-center text-xs font-semibold transition-colors",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                  selected
                    ? "border-action bg-action text-action-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                {option.shortLabel}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
