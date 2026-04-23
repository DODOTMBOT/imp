import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePizzerias } from '../../hooks/usePizzerias';
import type { Employee } from '../../types';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: { 
    name: string; 
    position: string; 
    pizzeria_id: number; 
    med_book_expiry: string;
    created_by: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const { user } = useAuth();
  const { pizzerias } = usePizzerias();
  
  const [name, setName] = useState(employee?.name || '');
  const [position, setPosition] = useState(employee?.position || '');
  const [pizzeriaId, setPizzeriaId] = useState(employee?.pizzeria_id || pizzerias[0]?.id || 0);
  const [medBookExpiry, setMedBookExpiry] = useState(employee?.med_book_expiry || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      name,
      position,
      pizzeria_id: pizzeriaId,
      med_book_expiry: medBookExpiry,
      created_by: user?.id || 1
    });
  };

  const availablePizzerias = pizzerias.filter(p => {
    if (user?.role === 'super_admin') return true;
    if (user?.role === 'franchisee') return p.franchisee_id === user.franchisee_id;
    return true;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          ФИО сотрудника
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Иванов Иван Иванович"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Должность
        </label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          required
        >
          <option value="">Выберите должность</option>
          <option value="Пиццамейкер">Пиццамейкер</option>
          <option value="Кассир">Кассир</option>
          <option value="Курьер">Курьер</option>
          <option value="Менеджер смены">Менеджер смены</option>
          <option value="Уборщик">Уборщик</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Пиццерия
        </label>
        <select
          value={pizzeriaId}
          onChange={(e) => setPizzeriaId(Number(e.target.value))}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          required
        >
          {availablePizzerias.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.franchisee_name})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Дата окончания медкнижки
        </label>
        <input
          type="date"
          value={medBookExpiry}
          onChange={(e) => setMedBookExpiry(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
          {employee ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}
