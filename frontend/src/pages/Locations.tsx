import { motion } from 'framer-motion';
import { usePizzerias } from '../hooks/usePizzerias';

export function Locations() {
  const { pizzerias, loading } = usePizzerias();

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
        <h1 className="text-3xl font-bold text-neutral-900">Locations</h1>
        <p className="text-neutral-500 mt-1">{pizzerias.length} pizza locations across all franchisees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pizzerias.map((pizzeria) => (
          <motion.div
            key={pizzeria.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg text-neutral-900">{pizzeria.name}</h3>
              <span className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-500">ID: {pizzeria.id}</span>
            </div>
            <p className="text-sm text-neutral-500 mb-4">{pizzeria.address}</p>
            <div className="pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-400 mb-1">Franchisee</p>
              <p className="text-sm font-medium text-neutral-700">{pizzeria.franchisee_name}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
