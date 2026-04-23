import { useState } from 'react';
import type { MedicalTest } from '../../types';

interface MedicalTestFormProps {
  test?: MedicalTest;
  franchiseeId: number;
  onSubmit: (data: { name: string; periodicity_days: number; franchisee_id: number }) => Promise<void>;
  onCancel: () => void;
}

export function MedicalTestForm({ test, franchiseeId, onSubmit, onCancel }: MedicalTestFormProps) {
  const [name, setName] = useState(test?.name || '');
  const [periodicityDays, setPeriodicityDays] = useState(test?.periodicity_days || 365);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      periodicity_days: periodicityDays,
      franchisee_id: franchiseeId
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Название анализа
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Флюорография"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Периодичность (дней)
        </label>
        <input
          type="number"
          value={periodicityDays}
          onChange={(e) => setPeriodicityDays(Number(e.target.value))}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="365"
          min="1"
          required
        />
        <p className="text-xs text-neutral-500 mt-1">
          Примерно {Math.round(periodicityDays / 30)} месяцев
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
        >
          {test ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}
