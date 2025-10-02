export function Input({ className = '', ...props }) {
  return (
    <input
      className={`h-12 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 ${className}`}
      {...props}
    />
  )
}


