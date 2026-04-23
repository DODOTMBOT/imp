import { useState, useEffect } from 'react';
import type { Franchisee } from '../../types';

interface FranchiseeFormProps {
  franchisee?: Franchisee;
  onSubmit: (data: { name: string; email: string; password?: string }) => Promise<void>;
  onCancel: () => void;
}

export function FranchiseeForm({ franchisee, onSubmit, onCancel }: FranchiseeFormProps) {
  const [name, setName] = useState(franchisee?.name || '');
  const [email, setEmail] = useState(franchisee?.email || '');
  const [password, setPassword] = useState('');

  const isEdit = !!franchisee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, email, ...(password && { password }) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Название компании
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Додо Пицца Москва"
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
          placeholder="contact@example.com"
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
