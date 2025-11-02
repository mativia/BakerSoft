import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { getUserInitials, getUserName } from '../../features/auth/userUtils.js';
import '../styles/TipoProducto.css';
import { getTiposProducto, deleteTipoProducto } from '../../services/tipoProductoService';

function TipoProducto() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [tiposProducto, setTiposProducto] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const hasAppliedRefreshRef = useRef(false);

  useEffect(() => {
    if (location.state?.refreshTipos && !hasAppliedRefreshRef.current) {
      hasAppliedRefreshRef.current = true;
      setReloadKey((prev) => prev + 1);
      navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true });
    } else if (!location.state?.refreshTipos) {
      hasAppliedRefreshRef.current = false;
    }
  }, [location.hash, location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    let cancelled = false;
    let debounceTimeoutId = null;

    const clearRetryTimeout = () => {
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };

    const fetchTiposProducto = async () => {
      if (cancelled) {
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let keepLoading = false;

      try {
        setIsLoading(true);
        const data = await getTiposProducto({ search: searchTerm, signal: controller.signal });

        if (cancelled) {
          return;
        }

        const resultados = Array.isArray(data?.results) ? data.results : data ?? [];
        setTiposProducto(resultados);
        clearRetryTimeout();
        setError(null);
      } catch (err) {
        if (cancelled) {
          keepLoading = true;
          return;
        }

        if (err?.name === 'AbortError') {
          return;
        }

        if (err?.status === 429) {
          keepLoading = true;
          setError('Limite de consultas alcanzado. Reintentaremos en unos segundos...');
          clearRetryTimeout();
          retryTimeoutRef.current = window.setTimeout(() => {
            if (!cancelled) {
              setReloadKey((prev) => prev + 1);
            }
            retryTimeoutRef.current = null;
          }, 2000);
        } else {
          const message = err?.message || 'Error al cargar los tipos de producto';
          setError(message);
        }
      } finally {
        if (!cancelled && !keepLoading) {
          setIsLoading(false);
        }
      }
    };

    debounceTimeoutId = window.setTimeout(fetchTiposProducto, 300);

    return () => {
      cancelled = true;
      if (debounceTimeoutId) {
        window.clearTimeout(debounceTimeoutId);
      }
      clearRetryTimeout();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [searchTerm, reloadKey]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDeleteClick = (tipo) => {
    setDeleteError(null);
    setDeleteTarget(tipo);
  };

  const handleCancelDelete = () => {
    if (isDeleting) {
      return;
    }

    setDeleteTarget(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteTipoProducto(deleteTarget.id);
      setTiposProducto((prevTipos) => prevTipos.filter((tipo) => tipo.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      const message = err?.message || 'Error al eliminar el tipo de producto';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const userInitials = useMemo(() => getUserInitials(user), [user]);
  const userName = useMemo(() => getUserName(user) || 'Perfil', [user]);

  return (
    <div className="tp-main">
      {deleteTarget ? (
        <div className="tp-modal-backdrop" role="presentation">
          <div
            className="tp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tp-delete-modal-title"
            aria-describedby="tp-delete-modal-description"
          >
            <header className="tp-modal-header">
              <h2 id="tp-delete-modal-title">Eliminar tipo de producto</h2>
            </header>
            <p id="tp-delete-modal-description" className="tp-modal-description">
              {`Estas seguro de que quieres eliminar "${deleteTarget.nombre}"? Esta accion no se puede deshacer.`}
            </p>
            {deleteError ? <p className="tp-modal-error">{deleteError}</p> : null}
            <footer className="tp-modal-actions">
              <button
                type="button"
                className="tp-modal-button tp-modal-button-secondary"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="tp-modal-button tp-modal-button-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
      <header className="tp-main-header">
        <div>
          <h1 className="tp-page-title">Lista de tipos de producto</h1>
        </div>
        <div className="tp-user-badge" title={userName} aria-label={`Perfil de ${userName}`}>
          <span aria-hidden="true">{userInitials}</span>
        </div>
      </header>

      <section className="tp-card">
        <div className="tp-toolbar">
          <div className="tp-search-wrapper">
            <div className="tp-search">
              <input
                type="text"
                className="tp-search-input"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearch}
                aria-label="Buscar tipos"
              />
            </div>
          </div>

          <button
            className="tp-button-primary tp-new-btn"
            onClick={() => navigate('/productos/tipos/nuevo')}
          >
            <span className="tp-button-icon">+</span>
            Nuevo tipo de producto
          </button>
        </div>

        <div className="tp-table-container">
          <table className="tp-table">
            <thead>
              <tr>
                <th className="tp-th">ID</th>
                <th className="tp-th">Nombre</th>
                <th className="tp-th">Descripcion</th>
                <th className="tp-th">Estado</th>
                <th className="tp-th tp-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="tp-td-center">
                    Cargando...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="tp-td-center tp-error">
                    {error}
                  </td>
                </tr>
              ) : tiposProducto.length === 0 ? (
                <tr>
                  <td colSpan={5} className="tp-td-center">
                    No se encontraron tipos de producto
                  </td>
                </tr>
              ) : (
                tiposProducto.map((tipo) => (
                  <tr key={tipo.id} className="tp-tr">
                    <td className="tp-td tp-code">{tipo.id}</td>
                    <td className="tp-td">{tipo.nombre}</td>
                    <td className="tp-td">{tipo.descripcion}</td>
                    <td className="tp-td">{tipo.estado}</td>
                    <td className="tp-td tp-td-actions">
                      <button
                        className="tp-action-button"
                        onClick={() => navigate(`/productos/tipos/editar/${tipo.id}`)}
                        aria-label={`Editar ${tipo.nombre}`}
                      >
                        ✏
                      </button>
                      <button
                        className="tp-action-button tp-action-delete"
                        onClick={() => handleDeleteClick(tipo)}
                        aria-label={`Eliminar ${tipo.nombre}`}
                        disabled={isDeleting && deleteTarget?.id === tipo.id}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default TipoProducto;
