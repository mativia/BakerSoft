import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout.jsx';
import Dashboard from './Dashboard/pages/Dashboard.jsx';
import {
  ListadoProductoPage,
  AltaProductoPage,
  EditarProductoPage,
  TipoProductoPage,
  AltaTipoProductoPage,
  EditarTipoProductoPage,
} from './Producto';
import Placeholder from './pages/Placeholder.jsx';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import ForgotPassword from './features/auth/ForgotPassword.jsx';
import ResetPassword from './features/auth/ResetPassword.jsx';
import { useAuth } from './features/auth/AuthContext.jsx';

function RequireAuth() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="productos">
            <Route index element={<ListadoProductoPage />} />
            <Route path="nuevo" element={<AltaProductoPage />} />
            <Route path="editar/:codigo" element={<EditarProductoPage />} />
            <Route path="tipos" element={<TipoProductoPage />} />
            <Route path="tipos/nuevo" element={<AltaTipoProductoPage />} />
            <Route path="tipos/editar/:id" element={<EditarTipoProductoPage />} />
            <Route path="stock" element={<Placeholder title="Stock de productos" />} />
          </Route>
          <Route path="stock" element={<Navigate to="/productos/stock" replace />} />
          <Route path="pedidos" element={<Placeholder title="Pedidos" />} />
          <Route path="clientes" element={<Placeholder title="Clientes" />} />
          <Route path="finanzas" element={<Placeholder title="Finanzas" />} />
          <Route path="configuraciones" element={<Placeholder title="Configuraciones" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
