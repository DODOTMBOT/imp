import { motion } from 'framer-motion';
import { useStats } from '../hooks/useStats';
import { StatCard } from '../components/StatCard';
import { Store, Users, AlertCircle, TrendingUp } from 'lucide-react';

export function Overview() {
  const { stats, loading } = useStats();

  if (loading) {
    return <div className="p-8">Загрузка...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Overview</h1>
        <p className="text-neutral-500 mt-1">Territory management dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Locations"
          value={stats.pizzeriaCount}
          icon={Store}
          color="blue"
        />
        <StatCard
          title="Employees"
          value={stats.employeeCount}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Health Alerts"
          value={stats.healthAlerts}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          title="Avg Staffing"
          value={`${stats.avgStaffing}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <ActivityItem color="green" text="New employee added to Додо Центр" time="2 hours ago" />
          <ActivityItem color="amber" text="Med book expiring soon for 3 employees" time="5 hours ago" />
          <ActivityItem color="blue" text="Weekly metrics submitted for Додо Север" time="1 day ago" />
        </div>
      </div>
    </motion.div>
  );
}

function ActivityItem({ color, text, time }: { color: string; text: string; time: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className={`w-2 h-2 rounded-full ${colorMap[color]}`} />
      <span className="text-neutral-600">{text}</span>
      <span className="ml-auto text-neutral-400">{time}</span>
    </div>
  );
}
