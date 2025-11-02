import { useMemo } from 'react';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { getUserInitials, getUserName } from '../../features/auth/userUtils.js';
import FormAltaProducto from '../components/FormAltaProducto.jsx';
import '../styles/styles.css';

function AltaProducto() {
  const { user } = useAuth();
  const initials = useMemo(() => getUserInitials(user), [user]);
  const name = useMemo(() => getUserName(user) || 'Perfil', [user]);

  return (
    <div className="tp-main">
      <header className="tp-main-header">
        <div>
          <h1 className="tp-page-title">Nuevo producto</h1>
        </div>
        <div className="tp-user-badge" title={name} aria-label={`Perfil de ${name}`}>
          <span aria-hidden="true">{initials}</span>
        </div>
      </header>

      <section className="tp-card">
        <FormAltaProducto />
      </section>
    </div>
  );
}

export default AltaProducto;
