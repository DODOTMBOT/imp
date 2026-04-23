import { useState, useEffect } from 'react';
import type { Manager, Pizzeria } from '../../types';
import axios from 'axios';

interface ManagerFormProps {
  manager?: Manager;
  pizzerias: Pizzeria[];
  onSubmit: (data: { name: string; email: string; password?: string; pizzeria_ids: number[] }) => Promise<void>;
  onCancel: () => void;
}

export function ManagerForm({ manager, pizzerias, onSubmit, onCancel }: ManagerFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPizzerias, setSelectedPizzerias] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const isEdit = !!manager;

  // Загружаем данные при монтировании
  useEffect(() => {
    if (manager) {
      setName(manager.name);
      setEmail(manager.email);
      loadManagerPizzerias();
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setSelectedPizzerias([]);
    }
  }, [manager?.id]); // Зависимость от ID чтобы перезагружать при смене управляющего

  const loadManagerPizzerias = async () => {
    if (!manager) return;
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/managers/${manager.id}/pizzerias`);
      const pizzeriaIds = res.data.map((p: Pizzeria) => p.id);
      setSelectedPizzerias(pizzeriaIds);
    } catch (err) {
      console.error('Failed to load manager pizzerias:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePizzeria = (id: number) => {
    setSelectedPizzerias(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      email,
      ...(password && { password }),
      pizzeria_ids: selectedPizzerias,
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-neutral-500">Загрузка...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Имя управляющего
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Иван Иванов"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="manager@example.com"
          required
        />
      </div>
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="••••••••"
            required
          />
        </div>
      )}
      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Новый пароль <span className="text-neutral-400">(опционально)</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Оставьте пустым, чтобы не менять"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Назначить на пиццерии
        </label>
        <div className="border border-neutral-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-neutral-50">
          {pizzerias.map(pizzeria => (
            <label key={pizzeria.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-white p-2.5 rounded transition-colors">
              <input
                type="checkbox"
                checked={selectedPizzerias.includes(pizzeria.id)}
                onChange={() => togglePizzeria(pizzeria.id)}
                className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black"
              />
              <span className="text-sm font-medium">{pizzeria.name}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Выбрано: {selectedPizzerias.length} {selectedPizzerias.length === 1 ? 'пиццерия' : 'пиццерий'}
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
          {isEdit ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}
