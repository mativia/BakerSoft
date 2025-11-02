import { useMemo, useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { getUserInitials, getUserName } from '../../features/auth/userUtils.js';
import BuscadorProducto from '../components/BuscadorProducto.jsx';
import BotonNuevoProducto from '../components/BotonNuevoProducto.jsx';
import TablaProductos from '../components/TablaProductos.jsx';
import FiltroProducto from '../components/FiltroProducto.jsx';
import MensajeResultados from '../components/MensajeResultados.jsx';
import MensajeSinResultados from '../components/MensajeSinResultados.jsx';
import '../styles/ConsultaProducto.css';
import '../styles/ListadoProducto.css';

const productosMock = [
  { codigo: '001', nombre: 'Pan Frances', categoria: 'Panaderia', estado: 'Activo' },
  { codigo: '002', nombre: 'Medialunas', categoria: 'Panaderia', estado: 'Activo' },
  { codigo: '003', nombre: 'Chips de chocolate', categoria: 'Pasteleria', estado: 'Activo' },
  { codigo: '004', nombre: 'Tarta frutal', categoria: 'Pasteleria', estado: 'Activo' },
  { codigo: '005', nombre: 'Scones integrales', categoria: 'Panaderia', estado: 'Inactivo' },
  { codigo: '006', nombre: 'Budin de limon', categoria: 'Pasteleria', estado: 'Activo' },
  { codigo: '007', nombre: 'Focaccia mediterranea', categoria: 'Panaderia', estado: 'Activo' },
  { codigo: '008', nombre: 'Brownies', categoria: 'Pasteleria', estado: 'Activo' },
];

function ListadoProducto() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltros, setEstadoFiltros] = useState([]);
  const [categoriaFiltros, setCategoriaFiltros] = useState([]);

  const productosFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return productosMock.filter((producto) => {
      const matchesSearch =
        term.length === 0 ||
        producto.nombre.toLowerCase().includes(term) ||
        producto.codigo.toLowerCase().includes(term) ||
        producto.categoria.toLowerCase().includes(term);

      const matchesEstado = estadoFiltros.length === 0 || estadoFiltros.includes(producto.estado);
      const matchesCategoria = categoriaFiltros.length === 0 || categoriaFiltros.includes(producto.categoria);

      return matchesSearch && matchesEstado && matchesCategoria;
    });
  }, [searchTerm, estadoFiltros, categoriaFiltros]);

  const manejarEdicion = (producto) => {
    console.info('Editar producto:', producto);
  };

  const manejarEliminacion = (producto) => {
    console.info('Eliminar producto:', producto);
  };

  const initials = useMemo(() => getUserInitials(user), [user]);
  const displayName = useMemo(() => getUserName(user) || 'Perfil', [user]);

  return (
    <div className="ltp-main">
      <header className="ltp-main-header">
        <div>
          <h1 className="ltp-page-title">Lista de productos</h1>
        </div>
        <div className="ltp-user-badge" title={displayName} aria-label={`Perfil de ${displayName}`}>
          <span aria-hidden="true">{initials}</span>
        </div>
      </header>

      <section className="ltp-card">
        <div className="ltp-toolbar">
          <div className="ctp-search-wrapper">
            <BuscadorProducto value={searchTerm} onChange={setSearchTerm}>
              <FiltroProducto
                selectedEstados={estadoFiltros}
                selectedCategorias={categoriaFiltros}
                onChange={(nextEstados, nextCategorias) => {
                  setEstadoFiltros(nextEstados);
                  setCategoriaFiltros(nextCategorias);
                }}
              />
            </BuscadorProducto>
          </div>
          <BotonNuevoProducto />
        </div>

        {productosFiltrados.length > 0 ? (
          <>
            <MensajeResultados
              term={searchTerm}
              estados={estadoFiltros}
              categorias={categoriaFiltros}
              total={productosFiltrados.length}
            />
            <TablaProductos productos={productosFiltrados} onEdit={manejarEdicion} onDelete={manejarEliminacion} />
          </>
        ) : (
          <>
            <MensajeResultados
              term={searchTerm}
              estados={estadoFiltros}
              categorias={categoriaFiltros}
              total={0}
            />
            <MensajeSinResultados
              onReset={() => {
                setSearchTerm('');
                setEstadoFiltros([]);
                setCategoriaFiltros([]);
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}

export default ListadoProducto;
