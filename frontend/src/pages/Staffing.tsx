import { motion } from 'framer-motion';

export function Staffing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Staffing</h1>
        <p className="text-neutral-500 mt-1">Plan vs actual staffing levels</p>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <p className="text-neutral-400">Coming soon...</p>
      </div>
    </motion.div>
  );
}
