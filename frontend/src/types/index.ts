export interface User {
  id: number;
  email: string;
  role: 'super_admin' | 'franchisee' | 'manager';
  name: string;
  franchisee_id?: number;
}

export interface Franchisee {
  id: number;
  name: string;
  user_id: number;
  user_name: string;
  email: string;
  created_by: number;
  created_at: string;
}

export interface Pizzeria {
  id: number;
  name: string;
  address: string;
  franchisee_id: number;
  franchisee_name: string;
  created_at: string;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  pizzeria_id: number;
  pizzeria_name: string;
  franchisee_name: string;
  med_book_expiry: string;
  created_by: number;
  created_at: string;
}

export interface Manager {
  id: number;
  name: string;
  email: string;
  franchisee_id: number;
}

export interface Stats {
  pizzeriaCount: number;
  employeeCount: number;
  healthAlerts: number;
  avgStaffing: number;
}

export type MedBookStatus = 'valid' | 'expiring' | 'expired';
