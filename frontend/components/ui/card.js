export function Card({ className = '', children }) {
  return <div className={`rounded-xl border border-gray-200 bg-white shadow-card ${className}`}>{children}</div>;
}

export function CardHeader({ className = '', children }) {
  return <div className={`p-4 border-b border-gray-100 ${className}`}>{children}</div>;
}

export function CardContent({ className = '', children }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}


