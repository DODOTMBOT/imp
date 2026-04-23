import { useState, useEffect } from 'react';
import { employeeMedicalTestApi } from '../services/api';
import type { EmployeeMedicalTest } from '../types';

export function useEmployeeMedicalTests(employeeId?: number) {
  const [tests, setTests] = useState<EmployeeMedicalTest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const response = await employeeMedicalTestApi.getAll(employeeId);
      setTests(response.data);
    } catch (error) {
      console.error('Failed to load employee medical tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [employeeId]);

  return { tests, loading, reload: load };
}
