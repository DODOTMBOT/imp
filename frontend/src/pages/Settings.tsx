import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Beaker } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMedicalTests } from '../hooks/useMedicalTests';
import { MedicalTestForm } from '../components/settings/MedicalTestForm';
import { Modal } from '../components/Modal';
import { medicalTestApi } from '../services/api';
import type { MedicalTest } from '../types';

export function Settings() {
  const { user } = useAuth();
  const { medicalTests, loading, reload } = useMedicalTests();
  const [modal, setModal] = useState<{ isOpen: boolean; test?: MedicalTest }>({ isOpen: false });

  const handleCreate = async (data: { name: string; periodicity_days: number; franchisee_id: number }) => {
    await medicalTestApi.create(data);
    await reload();
    setModal({ isOpen: false });
  };

  const handleEdit = async (data: { name: string; periodicity_days: number }) => {
    if (modal.test) {
      await medicalTestApi.update(modal.test.id, data);
      await reload();
      setModal({ isOpen: false });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить шаблон анализа? Это также удалит все связанные записи сотрудников.')) {
      await medicalTestApi.delete(id);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Настройки</h1>
        <p className="text-neutral-500 mt-1">Управление шаблонами анализов</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Beaker size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Шаблоны анализов</h2>
              <p className="text-sm text-neutral-500">Создайте типы анализов для медицинских книжек</p>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={() => setModal({ isOpen: true })}
              className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
            >
              <Plus size={18} />
              Добавить анализ
            </button>
          )}
        </div>

        <div className="space-y-3">
          {medicalTests.length > 0 ? (
            medicalTests.map(test => (
              <div
                key={test.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-neutral-900">{test.name}</h3>
                  <p className="text-sm text-neutral-500">
                    Периодичность: {test.periodicity_days} дней (~{Math.round(test.periodicity_days / 30)} мес.)
                  </p>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModal({ isOpen: true, test })}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-600"
                      title="Редактировать"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-neutral-400">
              <Beaker size={48} className="mx-auto mb-3 opacity-20" />
              <p>Пока нет шаблонов анализов</p>
              <p className="text-sm mt-1">Создайте первый шаблон для начала работы</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false })}
        title={modal.test ? 'Редактировать анализ' : 'Добавить анализ'}
      >
        <MedicalTestForm
          test={modal.test}
          franchiseeId={user?.franchisee_id || 1}
          onSubmit={modal.test ? handleEdit : handleCreate}
          onCancel={() => setModal({ isOpen: false })}
        />
      </Modal>
    </motion.div>
  );
}
