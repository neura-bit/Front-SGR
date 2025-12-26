import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AsesorDashboard } from './pages/asesor/AsesorDashboard';
import { SupervisorDashboard } from './pages/supervisor/SupervisorDashboard';
import { MensajeroDashboard } from './pages/mensajero/MensajeroDashboard';
import { BranchList } from './pages/admin/branches/BranchList';
import { RoleList } from './pages/admin/roles/RoleList';
import { TaskStatusList } from './pages/admin/task-statuses/TaskStatusList';
import { CategoryList } from './pages/admin/categories/CategoryList';
import { ClientList } from './pages/admin/clients/ClientList';
import { TaskTypeList } from './pages/admin/task-types/TaskTypeList';
import { UserList } from './pages/admin/users/UserList';
import { TaskList } from './pages/admin/tasks/TaskList.tsx';
import { Tracking } from './pages/admin/Tracking';
import { PerformanceDashboard } from './pages/admin/performance/PerformanceDashboard';
import { AsesorTaskList } from './pages/asesor/tasks/AsesorTaskList';

function App() {
  const { isAuthenticated, user } = useAuth();

  // Redirect to appropriate dashboard based on role
  const getDefaultRoute = (): string => {
    if (!isAuthenticated || !user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'ASESOR':
        return '/asesor/dashboard';
      case 'SUPERVISOR':
        return '/supervisor/dashboard';
      case 'MENSAJERO':
        return '/mensajero/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultRoute()} replace />}
      />

      {/* Home Route */}
      <Route
        path="/"
        element={<Navigate to={getDefaultRoute()} replace />}
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="tracking" element={<Tracking />} />
        <Route path="performance" element={<PerformanceDashboard />} />
        <Route path="users" element={<UserList />} />
        <Route path="task-types" element={<TaskTypeList />} />
        <Route path="clients" element={<ClientList />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="branches" element={<BranchList />} />
        <Route path="roles" element={<RoleList />} />
        <Route path="task-statuses" element={<TaskStatusList />} />
        <Route path="categories" element={<CategoryList />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Asesor Routes */}
      <Route
        path="/asesor/*"
        element={
          <ProtectedRoute allowedRoles={['ASESOR']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AsesorDashboard />} />
        <Route path="tasks" element={<AsesorTaskList />} />
        <Route path="clients" element={<ClientList />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Supervisor Routes */}
      <Route
        path="/supervisor/*"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SupervisorDashboard />} />
        <Route path="assignment" element={<div className="animate-fade-in"><h1>Asignación de Tareas</h1><p className="text-secondary">Funcionalidad en desarrollo</p></div>} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Mensajero Routes */}
      <Route
        path="/mensajero/*"
        element={
          <ProtectedRoute allowedRoles={['MENSAJERO']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<MensajeroDashboard />} />
        <Route path="tasks" element={<div className="animate-fade-in"><h1>Mis Tareas</h1><p className="text-secondary">Funcionalidad en desarrollo</p></div>} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
