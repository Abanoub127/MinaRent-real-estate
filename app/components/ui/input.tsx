import * as React from "react";
import { cn } from "./utils";

type InputProps = React.ComponentProps<"input"> & {
  icon?: React.ReactNode;
  label?: string;
};

function Input({ className, type, icon, label, ...props }: InputProps) {
  return (
    <div className="w-full space-y-1">
      
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Input + Icon */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        <input
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[0.1875rem]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            icon ? "pl-10" : "",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
export const TextArea: React.FC<{
  label?: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  className?: string;
}> = ({ label, className, ...props }) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <textarea
        {...props}
        className={cn(
          "w-full rounded-md border px-3 py-2 text-sm bg-input-background",
          "border-input dark:bg-input/30",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[0.1875rem]",
          "outline-none resize-none",
          className
        )}
      />
    </div>
  );
};

type SelectProps = React.ComponentProps<"select"> & {
  label?: string;
  options: {
    value: string;
    label: string;
  }[];
};

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className,
  ...props
}) => {
  return (
    <div className="w-full space-y-1">

      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <select
        {...props}
        className={cn(
          "w-full rounded-md border px-3 py-2 text-sm bg-input-background",
          "border-input dark:bg-input/30",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[0.1875rem]",
          "outline-none",
          className
        )}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

    </div>
  );
};
export { Input };