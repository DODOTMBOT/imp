interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ label, value, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 border border-neutral-200 ${className}`}>
      <p className="text-sm text-neutral-500 mb-1">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}
