import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(
  (
    {
      label,
      error,
      options = [],
      className = '',
      selectClassName = '',
      icon: Icon,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400">
              <Icon className="h-5 w-5" />
            </span>
          )}

          <select
            ref={ref}
            id={selectId}
            className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-11 text-sm font-medium text-slate-900 outline-none transition-all focus:ring-4 dark:bg-slate-900 dark:text-white ${
              Icon ? 'pl-11' : ''
            } ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
                : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/15 dark:border-slate-700'
            } ${selectClassName}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute inset-y-0 right-0 my-auto mr-4 h-5 w-5 text-slate-400" />
        </div>

        {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';