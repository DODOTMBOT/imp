import { useState } from 'react';
import type { Pizzeria } from '../../types';

interface PizzeriaFormProps {
  pizzeria?: Pizzeria;
  franchiseeId?: number;
  onSubmit: (data: { name: string; address: string; franchisee_id?: number }) => Promise<void>;
  onCancel: () => void;
}

export function PizzeriaForm({ pizzeria, franchiseeId, onSubmit, onCancel }: PizzeriaFormProps) {
  const [name, setName] = useState(pizzeria?.name || '');
  const [address, setAddress] = useState(pizzeria?.address || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      address,
      ...(franchiseeId && { franchisee_id: franchiseeId })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Название
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Додо Центр"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Адрес
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="ул. Ленина, 10"
          required
        />
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
          {pizzeria ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}
