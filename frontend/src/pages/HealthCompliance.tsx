import { motion } from 'framer-motion';
import { useEmployees } from '../hooks/useEmployees';
import { StatusBadge } from '../components/StatusBadge';
import { getMedBookStatus } from '../utils/medbook';

export function HealthCompliance() {
  const { employees, loading } = useEmployees();

  if (loading) {
    return <div className="p-8">Загрузка...</div>;
  }

  const employeesWithStatus = employees.map(emp => ({
    ...emp,
    status: getMedBookStatus(emp.med_book_expiry)
  }));

  const expiredCount = employeesWithStatus.filter(e => e.status === 'expired').length;
  const expiringCount = employeesWithStatus.filter(e => e.status === 'expiring').length;
  const validCount = employeesWithStatus.filter(e => e.status === 'valid').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Health Compliance</h1>
        <p className="text-neutral-500 mt-1">Medical book expiration tracking</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-500 mb-2">Valid</p>
          <p className="text-3xl font-bold text-green-600">{validCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-500 mb-2">Expiring Soon</p>
          <p className="text-3xl font-bold text-amber-600">{expiringCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-500 mb-2">Expired</p>
          <p className="text-3xl font-bold text-red-600">{expiredCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Position</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Franchisee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {employeesWithStatus.map((employee) => (
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
                <td className="px-6 py-4">
                  <StatusBadge status={employee.status} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
