import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const franchiseeApi = {
  getAll: () => api.get('/franchisees'),
  create: (data: { name: string; email: string; password: string; created_by: number }) =>
    api.post('/franchisees', data),
  update: (id: number, data: { name: string; email: string }) =>
    api.put(`/franchisees/${id}`, data),
  delete: (id: number) => api.delete(`/franchisees/${id}`),
};

export const pizzeriaApi = {
  getAll: (franchiseeId?: number) =>
    api.get('/pizzerias', { params: franchiseeId ? { franchisee_id: franchiseeId } : {} }),
  create: (data: { name: string; address: string; franchisee_id: number }) =>
    api.post('/pizzerias', data),
  update: (id: number, data: { name: string; address: string }) =>
    api.put(`/pizzerias/${id}`, data),
  delete: (id: number) => api.delete(`/pizzerias/${id}`),
};

export const managerApi = {
  getAll: (franchiseeId?: number) =>
    api.get('/managers', { params: franchiseeId ? { franchisee_id: franchiseeId } : {} }),
  getPizzerias: (id: number) =>
    api.get(`/managers/${id}/pizzerias`),
  create: (data: { name: string; email: string; password: string; franchisee_id: number; pizzeria_ids: number[] }) =>
    api.post('/managers', data),
  update: (id: number, data: { name: string; email: string; pizzeria_ids: number[] }) =>
    api.put(`/managers/${id}`, data),
  delete: (id: number) => api.delete(`/managers/${id}`),
};

export const employeeApi = {
  getAll: (pizzeriaId?: number, franchiseeId?: number) =>
    api.get('/employees', {
      params: {
        ...(pizzeriaId && { pizzeria_id: pizzeriaId }),
        ...(franchiseeId && { franchisee_id: franchiseeId })
      }
    }),
  create: (data: { name: string; position: string; pizzeria_id: number; med_book_expiry: string; created_by: number }) =>
    api.post('/employees', data),
  update: (id: number, data: { name: string; position: string; med_book_expiry: string }) =>
    api.put(`/employees/${id}`, data),
  delete: (id: number) =>
    api.delete(`/employees/${id}`),
};

export const medicalTestApi = {
  getAll: () => api.get('/medical-tests'),
  create: (data: { name: string; periodicity_days: number; franchisee_id: number }) =>
    api.post('/medical-tests', data),
  update: (id: number, data: { name: string; periodicity_days: number }) =>
    api.put(`/medical-tests/${id}`, data),
  delete: (id: number) => api.delete(`/medical-tests/${id}`),
};

export const employeeMedicalTestApi = {
  getAll: (employeeId?: number) =>
    api.get('/employee-medical-tests', { params: employeeId ? { employee_id: employeeId } : {} }),
  createBulk: (data: { employee_id: number; tests: { medical_test_id: number; expiry_date: string }[] }) =>
    api.post('/employee-medical-tests/bulk', data),
  delete: (id: number) => api.delete(`/employee-medical-tests/${id}`),
};

export const statsApi = {
  get: (franchiseeId?: number) =>
    api.get('/stats', { params: franchiseeId ? { franchisee_id: franchiseeId } : {} }),
};

export default api;
