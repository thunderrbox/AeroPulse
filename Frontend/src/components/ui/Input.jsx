import React from "react";

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      type = "text",
      className = "",
      inputClassName = "",
      icon: Icon,
      rightElement,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Icon className="h-5 w-5" />
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`h-12 w-full rounded-xl border bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 ${
              Icon ? "pl-11" : ""
            } ${rightElement ? "pr-11" : ""} ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
                : "border-slate-300 focus:border-primary-500 focus:ring-primary-500/15 dark:border-slate-700"
            } ${inputClassName}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-xs font-medium text-red-500">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
