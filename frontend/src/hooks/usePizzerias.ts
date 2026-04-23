import { useState, useEffect } from 'react';
import { pizzeriaApi } from '../services/api';
import type { Pizzeria } from '../types';

export function usePizzerias() {
  const [pizzerias, setPizzerias] = useState<Pizzeria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPizzerias();
  }, []);

  const loadPizzerias = async () => {
    try {
      setLoading(true);
      const { data } = await pizzeriaApi.getAll();
      setPizzerias(data);
      setError(null);
    } catch (err) {
      setError('Failed to load pizzerias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { pizzerias, loading, error, reload: loadPizzerias };
}
