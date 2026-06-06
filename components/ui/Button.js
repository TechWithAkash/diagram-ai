import clsx from 'clsx'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-display font-medium rounded-xl transition-all duration-150 select-none'

  const variants = {
    primary:   'bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)] active:scale-[0.98] disabled:opacity-50',
    secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50',
    ghost:     'text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:scale-[0.98]',
    danger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-[0.98]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'w-8 h-8 p-0 text-sm',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : null}
      {children}
    </button>
  )
}
