import clsx from 'clsx'

const variants = {
  brand:   'bg-[#EEEDFE] text-[#534AB7]',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-amber-50 text-amber-700',
  gray:    'bg-gray-100 text-gray-600',
  info:    'bg-blue-50 text-blue-700',
}

export default function Badge({ children, variant = 'brand', className = '' }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
