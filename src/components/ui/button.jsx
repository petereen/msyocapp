export function Button({ asChild, children, variant = 'default', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition active:scale-[0.98]'
  const variants = {
    default: 'bg-neutral-900 text-white hover:bg-neutral-800',
    outline: 'border border-neutral-300 bg-white hover:bg-neutral-50',
    ghost: 'bg-transparent hover:bg-neutral-100'
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', icon: 'p-2' }
  const cls = [base, variants[variant] || variants.default, sizes[size] || sizes.md, className].join(' ')
  if (asChild) return children
  return <button className={cls} {...props}>{children}</button>
}
