import PropTypes from 'prop-types';
import '../styles/ConsultaProducto.css';

function MensajeSinResultados({ onReset }) {
  return (
    <div className="ctp-empty-state" role="status">
      <div className="ctp-empty-icon" aria-hidden="true">
        🔍
      </div>
      <h3 className="ctp-empty-title">Sin resultados.</h3>
      <p className="ctp-empty-description">No se encontraron productos con ese nombre o estado.</p>
      <button type="button" className="ctp-empty-button" onClick={onReset}>
        Limpiar búsqueda
      </button>
    </div>
  );
}

MensajeSinResultados.propTypes = {
  onReset: PropTypes.func.isRequired,
};

export default MensajeSinResultados;

