import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFranchisees } from '../hooks/useFranchisees';
import { usePizzerias } from '../hooks/usePizzerias';
import { useManagers } from '../hooks/useManagers';
import { FranchiseeCard } from '../components/admin/FranchiseeCard';
import { FranchiseeForm } from '../components/admin/FranchiseeForm';
import { PizzeriaForm } from '../components/admin/PizzeriaForm';
import { ManagerForm } from '../components/admin/ManagerForm';
import { Modal } from '../components/Modal';
import { franchiseeApi, pizzeriaApi, managerApi } from '../services/api';
import type { Franchisee, Pizzeria, Manager } from '../types';
import { Building2, Store, Mail } from 'lucide-react';

export function Admin() {
  const { franchisees, reload: reloadFranchisees } = useFranchisees();
  const { pizzerias, reload: reloadPizzerias } = usePizzerias();
  const { managers, reload: reloadManagers } = useManagers();

  const [franchiseeModal, setFranchiseeModal] = useState<{ isOpen: boolean; franchisee?: Franchisee }>({ isOpen: false });
  const [pizzeriaModal, setPizzeriaModal] = useState<{ isOpen: boolean; pizzeria?: Pizzeria; franchiseeId?: number }>({ isOpen: false });
  const [managerModal, setManagerModal] = useState<{ isOpen: boolean; manager?: Manager; franchiseeId?: number }>({ isOpen: false });

  const handleCreateFranchisee = async (data: { name: string; email: string; password: string }) => {
    await franchiseeApi.create({ ...data, created_by: 1 });
    await reloadFranchisees();
    setFranchiseeModal({ isOpen: false });
  };

  const handleEditFranchisee = async (data: { name: string; email: string }) => {
    if (franchiseeModal.franchisee) {
      try {
        await franchiseeApi.update(franchiseeModal.franchisee.id, data);
        await reloadFranchisees();
        setFranchiseeModal({ isOpen: false });
      } catch (err) {
        console.error('Failed to update franchisee:', err);
      }
    }
  };

  const handleDeleteFranchisee = async (id: number) => {
    if (confirm('Удалить франчайзи и все связанные данные?')) {
      try {
        await franchiseeApi.delete(id);
        await reloadFranchisees();
        await reloadPizzerias();
        await reloadManagers();
      } catch (err) {
        console.error('Failed to delete franchisee:', err);
      }
    }
  };

  const handleCreatePizzeria = async (data: { name: string; address: string; franchisee_id: number }) => {
    await pizzeriaApi.create(data);
    await reloadPizzerias();
    setPizzeriaModal({ isOpen: false });
  };

  const handleEditPizzeria = async (data: { name: string; address: string }) => {
    if (pizzeriaModal.pizzeria) {
      await pizzeriaApi.update(pizzeriaModal.pizzeria.id, data);
      await reloadPizzerias();
      setPizzeriaModal({ isOpen: false });
    }
  };

  const handleDeletePizzeria = async (id: number) => {
    if (confirm('Удалить пиццерию?')) {
      await pizzeriaApi.delete(id);
      await reloadPizzerias();
    }
  };

  const handleCreateManager = async (data: { name: string; email: string; password?: string; pizzeria_ids: number[] }) => {
    if (managerModal.franchiseeId && data.password) {
      await managerApi.create({
        ...data,
        password: data.password,
        franchisee_id: managerModal.franchiseeId,
      });
      await reloadManagers();
      setManagerModal({ isOpen: false });
    }
  };

  const handleEditManager = async (data: { name: string; email: string; pizzeria_ids: number[] }) => {
    if (managerModal.manager) {
      await managerApi.update(managerModal.manager.id, data);
      await reloadManagers();
      setManagerModal({ isOpen: false });
    }
  };

  const handleDeleteManager = async (id: number) => {
    if (confirm('Удалить управляющего?')) {
      try {
        await managerApi.delete(id);
        await reloadManagers();
      } catch (err) {
        console.error('Failed to delete manager:', err);
      }
    }
  };

  const totalPizzerias = pizzerias.length;
  const totalManagers = managers.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Панель администратора</h1>
          <p className="text-neutral-500 mt-1">Управление франчайзи и управляющими</p>
        </div>
        <button
          onClick={() => setFranchiseeModal({ isOpen: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
        >
          <Plus size={18} />
          Создать франчайзи
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-100 rounded-lg">
              <Building2 size={20} className="text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Всего франчайзи</p>
              <p className="text-2xl font-bold text-neutral-900">{franchisees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-100 rounded-lg">
              <Store size={20} className="text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Всего пиццерий</p>
              <p className="text-2xl font-bold text-neutral-900">{totalPizzerias}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-100 rounded-lg">
              <Mail size={20} className="text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Управляющих</p>
              <p className="text-2xl font-bold text-neutral-900">{totalManagers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Franchisee Cards */}
      <div className="space-y-6">
        {franchisees.map(franchisee => (
          <FranchiseeCard
            key={franchisee.id}
            franchisee={franchisee}
            pizzerias={pizzerias.filter(p => p.franchisee_id === franchisee.id)}
            managers={managers.filter(m => m.franchisee_id === franchisee.id)}
            onEdit={() => setFranchiseeModal({ isOpen: true, franchisee })}
            onDelete={() => handleDeleteFranchisee(franchisee.id)}
            onAddPizzeria={() => setPizzeriaModal({ isOpen: true, franchiseeId: franchisee.id })}
            onEditPizzeria={(pizzeria) => setPizzeriaModal({ isOpen: true, pizzeria })}
            onDeletePizzeria={handleDeletePizzeria}
            onAddManager={() => setManagerModal({ isOpen: true, franchiseeId: franchisee.id })}
            onEditManager={(manager) => setManagerModal({ isOpen: true, manager, franchiseeId: franchisee.id })}
            onDeleteManager={handleDeleteManager}
          />
        ))}
      </div>

      {/* Modals */}
      <Modal
        isOpen={franchiseeModal.isOpen}
        onClose={() => setFranchiseeModal({ isOpen: false })}
        title={franchiseeModal.franchisee ? 'Редактировать франчайзи' : 'Создать франчайзи'}
      >
        <FranchiseeForm
          franchisee={franchiseeModal.franchisee}
          onSubmit={franchiseeModal.franchisee ? handleEditFranchisee : handleCreateFranchisee}
          onCancel={() => setFranchiseeModal({ isOpen: false })}
        />
      </Modal>

      <Modal
        isOpen={pizzeriaModal.isOpen}
        onClose={() => setPizzeriaModal({ isOpen: false })}
        title={pizzeriaModal.pizzeria ? 'Редактировать пиццерию' : 'Создать пиццерию'}
      >
        <PizzeriaForm
          pizzeria={pizzeriaModal.pizzeria}
          franchiseeId={pizzeriaModal.franchiseeId || pizzeriaModal.pizzeria?.franchisee_id}
          onSubmit={pizzeriaModal.pizzeria ? handleEditPizzeria : handleCreatePizzeria}
          onCancel={() => setPizzeriaModal({ isOpen: false })}
        />
      </Modal>

      <Modal
        isOpen={managerModal.isOpen}
        onClose={() => setManagerModal({ isOpen: false })}
        title={managerModal.manager ? 'Редактировать управляющего' : 'Создать управляющего'}
      >
        <ManagerForm
          manager={managerModal.manager}
          pizzerias={pizzerias.filter(p => p.franchisee_id === managerModal.franchiseeId)}
          onSubmit={managerModal.manager ? handleEditManager : handleCreateManager}
          onCancel={() => setManagerModal({ isOpen: false })}
        />
      </Modal>
    </motion.div>
  );
}
