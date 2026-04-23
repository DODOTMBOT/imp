import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { Admin } from './pages/Admin';
import { Locations } from './pages/Locations';
import { Employees } from './pages/Employees';
import { HealthCompliance } from './pages/HealthCompliance';
import { Staffing } from './pages/Staffing';
import { Metrics } from './pages/Metrics';
import { Login } from './pages/Login';

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Overview />} />
          {user.role === 'super_admin' && <Route path="/admin" element={<Admin />} />}
          <Route path="/locations" element={<Locations />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/health" element={<HealthCompliance />} />
          <Route path="/staffing" element={<Staffing />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function LoginRoute() {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <Login />;
}

export default App;
