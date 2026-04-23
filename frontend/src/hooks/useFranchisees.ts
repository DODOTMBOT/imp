import { useState, useEffect } from 'react';
import { franchiseeApi } from '../services/api';
import type { Franchisee } from '../types';

export function useFranchisees() {
  const [franchisees, setFranchisees] = useState<Franchisee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFranchisees();
  }, []);

  const loadFranchisees = async () => {
    try {
      setLoading(true);
      const { data } = await franchiseeApi.getAll();
      setFranchisees(data);
    } catch (err) {
      console.error('Failed to load franchisees:', err);
    } finally {
      setLoading(false);
    }
  };

  return { franchisees, loading, reload: loadFranchisees };
}
