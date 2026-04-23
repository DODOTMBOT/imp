import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import type { Franchisee, Pizzeria, Manager } from '../../types';

interface ManagerWithPizzerias extends Manager {
  pizzerias?: Pizzeria[];
}

interface FranchiseeCardProps {
  franchisee: Franchisee;
  pizzerias: Pizzeria[];
  managers: Manager[];
  onEdit: () => void;
  onDelete: () => void;
  onAddManager: () => void;
  onAddPizzeria: () => void;
  onEditPizzeria: (pizzeria: Pizzeria) => void;
  onDeletePizzeria: (id: number) => void;
  onEditManager: (manager: Manager) => void;
  onDeleteManager: (id: number) => void;
}

export function FranchiseeCard({
  franchisee,
  pizzerias,
  managers,
  onEdit,
  onDelete,
  onAddManager,
  onAddPizzeria,
  onEditPizzeria,
  onDeletePizzeria,
  onEditManager,
  onDeleteManager,
}: FranchiseeCardProps) {
  const [managersWithPizzerias, setManagersWithPizzerias] = useState<ManagerWithPizzerias[]>([]);

  useEffect(() => {
    loadManagerPizzerias();
  }, [managers]);

  const loadManagerPizzerias = async () => {
    const enriched = await Promise.all(
      managers.map(async (manager) => {
        try {
          const res = await axios.get(`http://localhost:3000/managers/${manager.id}/pizzerias`);
          return { ...manager, pizzerias: res.data };
        } catch (err) {
          return { ...manager, pizzerias: [] };
        }
      })
    );
    setManagersWithPizzerias(enriched);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-100 bg-neutral-50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-neutral-900">{franchisee.name}</h3>
            <p className="text-sm text-neutral-500 mt-0.5">{franchisee.email}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-white rounded-lg transition-colors text-neutral-600 hover:text-neutral-900"
              title="Редактировать"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
              title="Удалить"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Pizzerias */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-neutral-700">
                Пиццерии <span className="text-neutral-400 font-normal">({pizzerias.length})</span>
              </h4>
              <button
                onClick={onAddPizzeria}
                className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={14} />
                Добавить
              </button>
            </div>
            <div className="space-y-2">
              {pizzerias.length > 0 ? (
                pizzerias.map(p => (
                  <div key={p.id} className="flex items-start justify-between group py-1.5">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <div className="w-1 h-1 rounded-full bg-neutral-400 mt-2 flex-shrink-0" />
                      <span className="text-sm text-neutral-700 leading-relaxed">{p.name}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity ml-2 flex-shrink-0">
                      <button
                        onClick={() => onEditPizzeria(p)}
                        className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => onDeletePizzeria(p.id)}
                        className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-400 italic py-2">Пока нет пиццерий</p>
              )}
            </div>
          </div>

          {/* Managers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-neutral-700">
                Управляющие <span className="text-neutral-400 font-normal">({managers.length})</span>
              </h4>
              <button
                onClick={onAddManager}
                className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={14} />
                Добавить
              </button>
            </div>
            <div className="space-y-3">
              {managersWithPizzerias.length > 0 ? (
                managersWithPizzerias.map(m => (
                  <div key={m.id} className="group">
                    <div className="flex items-start justify-between py-1">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <span className="text-sm text-neutral-700 font-medium leading-relaxed">{m.name}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity ml-2 flex-shrink-0">
                        <button
                          onClick={() => onEditManager(m)}
                          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteManager(m.id)}
                          className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {m.pizzerias && m.pizzerias.length > 0 && (
                      <div className="ml-3 mt-1 space-y-0.5">
                        {m.pizzerias.map((p: Pizzeria) => (
                          <p key={p.id} className="text-xs text-neutral-400 leading-relaxed">→ {p.name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-400 italic py-2">Пока нет управляющих</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
