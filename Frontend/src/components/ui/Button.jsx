

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  icon: Icon,
  type = 'button',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'bg-primary-600 cursor-pointer text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-primary-600/30 active:scale-[0.98] focus:ring-primary-500/20',
    secondary:
      'bg-slate-100 cursor-pointer text-slate-800 hover:bg-slate-200 active:scale-[0.98] focus:ring-slate-300/40 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    outline:
      'border cursor-pointer border-slate-300 bg-transparent text-slate-700 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 active:scale-[0.98] focus:ring-primary-500/15 dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-500 dark:hover:bg-primary-950/30 dark:hover:text-primary-300',
    ghost:
      'bg-transparent cursor-pointer text-slate-700 hover:bg-slate-100 hover:text-primary-700 active:scale-[0.98] focus:ring-primary-500/15 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-primary-300',
    danger:
      'bg-red-600 cursor-pointer text-white shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-[0.98] focus:ring-red-500/20',
    glass:
      'border cursor-pointer border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 active:scale-[0.98] focus:ring-white/20',
  };

  const sizes = {
    sm: 'min-h-10 px-4 text-sm',
    md: 'min-h-11 px-5 text-sm',
    lg: 'min-h-12 px-6 text-base',
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}

      {children}
    </button>
  );
};