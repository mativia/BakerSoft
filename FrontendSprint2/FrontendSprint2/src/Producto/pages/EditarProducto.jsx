import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { getUserInitials, getUserName } from '../../features/auth/userUtils.js';
import FormEditarProducto from '../components/FormEditarProducto.jsx';
import { getTipoProductoById } from '../../services/tipoProductoService';
import '../styles/EditarProducto.css';

function mapApiProducto(data, fallbackId) {
  if (!data || typeof data !== 'object') {
    return {
      id: fallbackId ?? '',
      code: '',
      category: '',
      name: '',
      price: '',
      description: '',
      active: true,
      image: null,
    };
  }

  const estado = data.estado ?? data.activo ?? data.status;
  return {
    id: data.id ?? fallbackId ?? '',
    code: data.codigo ?? '',
    category: data.categoria ?? '',
    name: data.nombre ?? '',
    price: data.precio != null ? String(data.precio) : '',
    description: data.descripcion ?? '',
    active:
      typeof estado === 'string'
        ? estado.toLowerCase() === 'activo'
        : Boolean(estado),
    image: null,
  };
}

function EditarProducto() {
  const { codigo } = useParams();
  const { user } = useAuth();
  const [rawProduct, setRawProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducto() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTipoProductoById(codigo);
        if (!cancelled) {
          setRawProduct(data);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Ocurrio un problema al cargar el producto.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducto();
    return () => {
      cancelled = true;
    };
  }, [codigo]);

  const product = useMemo(() => {
    if (!rawProduct) {
      return null;
    }
    return mapApiProducto(rawProduct, codigo);
  }, [rawProduct, codigo]);

  const initials = useMemo(() => getUserInitials(user), [user]);
  const displayName = useMemo(() => getUserName(user) || 'Perfil', [user]);

  if (loading) {
    return (
      <div className="etp-main">
        <header className="etp-header">
          <h1 className="etp-title">Editar producto</h1>
        </header>
        <div className="etp-card">
          <p>Cargando informacion del producto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="etp-main">
        <header className="etp-header">
          <h1 className="etp-title">Editar producto</h1>
        </header>
        <div className="etp-card">
          <p>{error}</p>
          <Link className="etp-btn etp-btn-primary" to="/productos">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="etp-main">
        <header className="etp-header">
          <h1 className="etp-title">Editar producto</h1>
        </header>
        <div className="etp-card">
          <p>No encontramos el producto solicitado.</p>
          <Link className="etp-btn etp-btn-primary" to="/productos">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="etp-main">
      <header className="etp-header">
        <div>
          <h1 className="etp-title">Editar producto</h1>
        </div>
        <div className="etp-user-badge" title={displayName} aria-label={`Perfil de ${displayName}`}>
          <span aria-hidden="true">{initials}</span>
        </div>
      </header>

      <section className="etp-card">
        <FormEditarProducto productId={product.id} product={product} />
      </section>
    </div>
  );
}

export default EditarProducto;
