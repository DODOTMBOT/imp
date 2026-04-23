import { useState, useEffect } from 'react';
import { statsApi } from '../services/api';
import type { Stats } from '../types';

export function useStats(franchiseeId?: number) {
  const [stats, setStats] = useState<Stats>({ 
    pizzeriaCount: 0, 
    employeeCount: 0, 
    healthAlerts: 0, 
    avgStaffing: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [franchiseeId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const { data } = await statsApi.get(franchiseeId);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, reload: loadStats };
}
