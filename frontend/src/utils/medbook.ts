import type { MedBookStatus } from '../types';

export function getMedBookStatus(expiryDate: string): MedBookStatus {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry < 30) return 'expiring';
  return 'valid';
}

export function getStatusConfig(status: MedBookStatus) {
  const configs = {
    valid: {
      label: 'Valid',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      dotColor: 'bg-green-500',
    },
    expiring: {
      label: 'Expiring Soon',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      dotColor: 'bg-amber-500',
    },
    expired: {
      label: 'Expired',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      dotColor: 'bg-red-500',
    },
  };
  return configs[status];
}
