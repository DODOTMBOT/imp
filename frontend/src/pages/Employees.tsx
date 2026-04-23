import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../contexts/AuthContext';
import { EmployeeForm } from '../components/employees/EmployeeForm';
import { Modal } from '../components/Modal';
import { employeeApi } from '../services/api';
import type { Employee } from '../types';

export function Employees() {
  const { user } = useAuth();
  const { employees, loading, reload } = useEmployees();
  const [modal, setModal] = useState<{ isOpen: boolean; employee?: Employee }>({ isOpen: false });

  const handleCreate = async (data: { 
    name: string; 
    position: string; 
    pizzeria_id: number; 
    med_book_expiry: string;
    created_by: number;
  }) => {
    await employeeApi.create(data);
    await reload();
    setModal({ isOpen: false });
  };

  const handleEdit = async (data: { 
    name: string; 
    position: string; 
    med_book_expiry: string;
  }) => {
    if (modal.employee) {
      await employeeApi.update(modal.employee.id, data);
      await reload();
      setModal({ isOpen: false });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить сотрудника?')) {
      await employeeApi.delete(id);
      await reload();
    }
  };

  if (loading) {
    return <div className="p-8">Загрузка...</div>;
  }

  const canEdit = user?.role === 'super_admin' || user?.role === 'franchisee';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Сотрудники</h1>
          <p className="text-neutral-500 mt-1">{employees.length} сотрудников во всех локациях</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setModal({ isOpen: true })}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
          >
            <Plus size={18} />
            Добавить сотрудника
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Имя</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Должность</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Локация</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Франчайзи</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Медкнижка</th>
              {canEdit && (
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Действия</th>
              )}
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
                {canEdit && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ isOpen: true, employee })}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-600"
                        title="Редактировать"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        title="Удалить"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false })}
        title={modal.employee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
      >
        <EmployeeForm
          employee={modal.employee}
          onSubmit={modal.employee ? handleEdit : handleCreate}
          onCancel={() => setModal({ isOpen: false })}
        />
      </Modal>
    </motion.div>
  );
}
