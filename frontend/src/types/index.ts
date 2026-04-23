export interface User {
  id: number;
  email: string;
  role: string;
  name: string;
  franchisee_id: number | null;
}

export interface Franchisee {
  id: number;
  name: string;
  user_id: number;
  user_name?: string;
  email?: string;
  created_by: number;
}

export interface Pizzeria {
  id: number;
  name: string;
  address: string;
  franchisee_id: number;
  franchisee_name?: string;
}

export interface Manager extends User {
  franchisee_id: number;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  pizzeria_id: number;
  pizzeria_name?: string;
  franchisee_name?: string;
  med_book_expiry: string;
  created_by: number;
}

export interface MedicalTest {
  id: number;
  name: string;
  periodicity_days: number;
  franchisee_id: number;
  created_by: number;
  created_at: string;
}

export interface EmployeeMedicalTest {
  id: number;
  employee_id: number;
  employee_name?: string;
  medical_test_id: number;
  test_name?: string;
  periodicity_days?: number;
  expiry_date: string;
  created_by: number;
  created_at: string;
}

export interface Stats {
  pizzeriaCount: number;
  employeeCount: number;
  healthAlerts: number;
  avgStaffing: number;
}
