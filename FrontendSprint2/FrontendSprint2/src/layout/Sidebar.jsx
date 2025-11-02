import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import './AppLayout.css';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { getUserEmail, getUserInitials, getUserName } from '../features/auth/userUtils.js';

const homeLink = { label: 'Inicio', to: '/', exact: true };
const mainLinks = [
  { label: 'Pedidos', to: '/pedidos' },
  { label: 'Clientes', to: '/clientes' },
  { label: 'Finanzas', to: '/finanzas' },
];
const footerItem = { label: 'Configuraciones', to: '/configuraciones' };
const productsSubmenuItems = [
  { label: 'Productos', to: '/productos', exact: true },
  { label: 'Tipo de Producto', to: '/productos/tipos' },
  { label: 'Stock', to: '/productos/stock' },
];

const productsSubmenuId = 'sidebar-products-submenu';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isProductsRoute = location.pathname.startsWith('/productos');
  const [isProductsOpen, setIsProductsOpen] = useState(isProductsRoute);
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsProductsOpen(isProductsRoute);
  }, [isProductsRoute]);

  const handlePrimaryClick = () => {
    if (!isProductsRoute) {
      setIsProductsOpen(false);
    }
  };

  const toggleProducts = () => {
    setIsProductsOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = useMemo(() => getUserInitials(user), [user]);
  const displayName = useMemo(() => getUserName(user) || 'Usuario', [user]);
  const email = useMemo(() => getUserEmail(user), [user]);

  return (
    <aside className="app-sidebar">
      <div className="app-brand">
        <span className="app-brand-title">Panaderia</span>
        <span className="app-brand-subtitle">PELLEGRINI</span>
      </div>

      <div className="app-user-summary">
        <div className="app-user-avatar" aria-hidden="true">
          <span>{initials}</span>
        </div>
        <div className="app-user-meta">
          <span className="app-user-name">{displayName}</span>
          {email ? <span className="app-user-email">{email}</span> : null}
        </div>
      </div>

      <nav className="app-menu" aria-label="Menu principal">
        <NavLink
          key="inicio"
          to={homeLink.to}
          end
          role="menuitem"
          className={({ isActive }) => clsx('app-menu-link', { active: isActive })}
          onClick={handlePrimaryClick}
        >
          <span className="app-menu-label">{homeLink.label}</span>
        </NavLink>

        <div className={clsx('app-menu-group-container', { open: isProductsOpen })}>
          <button
            type="button"
            className="app-menu-link app-menu-group-toggle"
            onClick={toggleProducts}
            aria-expanded={isProductsOpen}
            aria-controls={productsSubmenuId}
            aria-haspopup="true"
            role="menuitem"
          >
            <span className="app-menu-label">Productos</span>
          </button>

          <div
            id={productsSubmenuId}
            className={clsx('app-submenu', { open: isProductsOpen })}
            role="group"
            aria-label="Submenu Productos"
          >
            {productsSubmenuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                role="menuitem"
                className={({ isActive }) => clsx('app-submenu-link', { active: isActive })}
                end={Boolean(item.exact)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {mainLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            role="menuitem"
            className={({ isActive }) => clsx('app-menu-link', { active: isActive })}
            onClick={handlePrimaryClick}
          >
            <span className="app-menu-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="app-menu-footer">
        <NavLink
          to={footerItem.to}
          role="menuitem"
          className={({ isActive }) => clsx('app-menu-link', { active: isActive })}
          onClick={handlePrimaryClick}
        >
          <span className="app-menu-label">{footerItem.label}</span>
        </NavLink>
        <button type="button" className="app-menu-link app-menu-logout" onClick={handleLogout}>
          <span className="app-menu-label">Cerrar sesion</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
