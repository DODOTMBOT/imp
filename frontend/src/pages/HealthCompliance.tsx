import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployeeMedicalTests } from '../hooks/useEmployeeMedicalTests';
import { MedicalBookForm } from '../components/health/MedicalBookForm';
import { Modal } from '../components/Modal';
import { employeeMedicalTestApi } from '../services/api';

export function HealthCompliance() {
  const { user } = useAuth();
  const { tests, loading, reload } = useEmployeeMedicalTests();
  const [modal, setModal] = useState(false);

  const handleCreate = async (data: { 
    employee_id: number; 
    tests: { medical_test_id: number; expiry_date: string }[] 
  }) => {
    await employeeMedicalTestApi.createBulk(data);
    await reload();
    setModal(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить запись об анализе?')) {
      await employeeMedicalTestApi.delete(id);
      await reload();
    }
  };

  const getStatusColor = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'text-red-600 bg-red-50';
    if (daysUntilExpiry < 30) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusLabel = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'Просрочен';
    if (daysUntilExpiry < 30) return 'Истекает скоро';
    return 'Действителен';
  };

  if (loading) {
    return <div className="p-8">Загрузка...</div>;
  }

  const canEdit = user?.role === 'super_admin' || user?.role === 'franchisee' || user?.role === 'manager';

  // Группируем по сотрудникам
  const groupedTests = tests.reduce((acc, test) => {
    if (!acc[test.employee_id]) {
      acc[test.employee_id] = {
        employee_name: test.employee_name || '',
        tests: []
      };
    }
    acc[test.employee_id].tests.push(test);
    return acc;
  }, {} as Record<number, { employee_name: string; tests: typeof tests }>);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Личные медицинские книжки</h1>
          <p className="text-neutral-500 mt-1">Управление анализами сотрудников</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
          >
            <Plus size={18} />
            Создать ЛМК
          </button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTests).length > 0 ? (
          Object.entries(groupedTests).map(([employeeId, data]) => (
            <div key={employeeId} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
                <h3 className="font-semibold text-neutral-900">{data.employee_name}</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.tests.map(test => (
                    <div
                      key={test.id}
                      className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">{test.test_name}</h4>
                          <p className="text-sm text-neutral-500 mt-1">
                            Срок до: {new Date(test.expiry_date).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => handleDelete(test.id)}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-600"
                            title="Удалить"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.expiry_date)}`}>
                        {getStatusLabel(test.expiry_date)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <p className="text-neutral-400">Нет записей о медицинских книжках</p>
            <p className="text-sm text-neutral-400 mt-1">Создайте первую ЛМК для начала работы</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Создать ЛМК"
      >
        <MedicalBookForm
          onSubmit={handleCreate}
          onCancel={() => setModal(false)}
        />
      </Modal>
    </motion.div>
  );
}
