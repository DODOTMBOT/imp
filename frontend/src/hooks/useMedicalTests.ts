import { useState, useEffect } from 'react';
import { medicalTestApi } from '../services/api';
import type { MedicalTest } from '../types';

export function useMedicalTests() {
  const [medicalTests, setMedicalTests] = useState<MedicalTest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const response = await medicalTestApi.getAll();
      setMedicalTests(response.data);
    } catch (error) {
      console.error('Failed to load medical tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { medicalTests, loading, reload: load };
}
