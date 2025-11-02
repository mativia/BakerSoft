import PropTypes from 'prop-types';
import '../styles/BajaProducto.css';

function ModalConfirmacion({ open, mode, productName, onCancel, onConfirm }) {
  if (!open) {
    return null;
  }

  const isActivating = mode === 'activate';
  const title = isActivating ? 'Reactivar producto' : 'Desactivar producto';
  const description = isActivating
    ? `¿Estás seguro de que quieres activar el producto "${productName}"? Todos los productos asociados se activarán automáticamente.`
    : `¿Estás seguro de que quieres desactivar el producto "${productName}"? Todos los productos asociados también se marcarán como inactivos.`;

  return (
    <div className="btp-modal-backdrop" role="presentation">
      <div className="btp-modal" role="dialog" aria-modal="true" aria-labelledby="btp-modal-title">
        <header className="btp-modal-header">
          <h2 id="btp-modal-title">{title}</h2>
        </header>
        <p className="btp-modal-description">{description}</p>
        <footer className="btp-modal-actions">
          <button type="button" className="btp-btn btp-btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btp-btn btp-btn-primary" onClick={onConfirm}>
            Confirmar
          </button>
        </footer>
      </div>
    </div>
  );
}

ModalConfirmacion.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['activate', 'deactivate']).isRequired,
  productName: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ModalConfirmacion;




