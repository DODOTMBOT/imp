import { motion } from 'framer-motion';
import { useEmployees } from '../hooks/useEmployees';

export function Employees() {
  const { employees, loading } = useEmployees();

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
        <h1 className="text-3xl font-bold text-neutral-900">Employees</h1>
        <p className="text-neutral-500 mt-1">{employees.length} staff members across all locations</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Position</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Franchisee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Med Book Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {employees.map((employee) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-neutral-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-neutral-900">{employee.name}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{employee.position}</td>
                <td className="px-6 py-4 text-sm text-neutral-500">{employee.pizzeria_name}</td>
                <td className="px-6 py-4 text-sm text-neutral-500">{employee.franchisee_name}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{employee.med_book_expiry}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
