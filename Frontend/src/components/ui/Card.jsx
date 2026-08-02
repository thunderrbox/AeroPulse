

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        glass
          ? 'bg-white/10 backdrop-blur-md border-white/20 dark:bg-slate-950/20 dark:border-slate-800/30'
          : 'bg-cyan-300 dark:bg-slate-900 border-slate-100 dark:border-slate-800'
      } ${
        hoverEffect
          ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none'
          : 'shadow-sm'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
