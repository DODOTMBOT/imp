import { useState } from 'react';
import { useEmployees } from '../../hooks/useEmployees';
import { useMedicalTests } from '../../hooks/useMedicalTests';
import { useAuth } from '../../contexts/AuthContext';

interface MedicalBookFormProps {
  onSubmit: (data: { 
    employee_id: number; 
    tests: { medical_test_id: number; expiry_date: string }[] 
  }) => Promise<void>;
  onCancel: () => void;
}

export function MedicalBookForm({ onSubmit, onCancel }: MedicalBookFormProps) {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { medicalTests } = useMedicalTests();
  
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [selectedTests, setSelectedTests] = useState<Map<number, string>>(new Map());

  const handleTestToggle = (testId: number) => {
    const newSelected = new Map(selectedTests);
    if (newSelected.has(testId)) {
      newSelected.delete(testId);
    } else {
      // Устанавливаем дату через год по умолчанию
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() + 1);
      newSelected.set(testId, defaultDate.toISOString().split('T')[0]);
    }
    setSelectedTests(newSelected);
  };

  const handleDateChange = (testId: number, date: string) => {
    const newSelected = new Map(selectedTests);
    newSelected.set(testId, date);
    setSelectedTests(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId) {
      alert('Выберите сотрудника');
      return;
    }
    
    if (selectedTests.size === 0) {
      alert('Выберите хотя бы один анализ');
      return;
    }
    
    const tests = Array.from(selectedTests.entries()).map(([medical_test_id, expiry_date]) => ({
      medical_test_id,
      expiry_date
    }));
    
    await onSubmit({ employee_id: employeeId, tests });
  };

  const availableEmployees = employees.filter(e => {
    if (user?.role === 'super_admin') return true;
    if (user?.role === 'franchisee') return e.pizzeria_id;
    return true;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Сотрудник
        </label>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(Number(e.target.value))}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          required
        >
          <option value={0}>Выберите сотрудника</option>
          {availableEmployees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} - {emp.pizzeria_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Анализы
        </label>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {medicalTests.length > 0 ? (
            medicalTests.map(test => {
              const isSelected = selectedTests.has(test.id);
              return (
                <div
                  key={test.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`test-${test.id}`}
                      checked={isSelected}
                      onChange={() => handleTestToggle(test.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor={`test-${test.id}`} className="cursor-pointer">
                        <p className="font-medium text-neutral-900">{test.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Периодичность: {test.periodicity_days} дней
                        </p>
                      </label>
                      
                      {isSelected && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-neutral-600 mb-1">
                            Срок действия до:
                          </label>
                          <input
                            type="date"
                            value={selectedTests.get(test.id) || ''}
                            onChange={(e) => handleDateChange(test.id, e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-neutral-400">
              <p className="text-sm">Нет доступных анализов</p>
              <p className="text-xs mt-1">Сначала создайте шаблоны в настройках</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
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
          Создать ЛМК
        </button>
      </div>
    </form>
  );
}
