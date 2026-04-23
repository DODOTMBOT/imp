import { useState, useEffect } from 'react';
import { managerApi } from '../services/api';
import type { Manager } from '../types';

export function useManagers(franchiseeId?: number) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManagers();
  }, [franchiseeId]);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const { data } = await managerApi.getAll(franchiseeId);
      setManagers(data);
    } catch (err) {
      console.error('Failed to load managers:', err);
    } finally {
      setLoading(false);
    }
  };

  return { managers, loading, reload: loadManagers };
}
