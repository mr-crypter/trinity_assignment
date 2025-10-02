export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand ring-1 ring-inset ring-brand/20 ${className}`}>
      {children}
    </span>
  )
}


