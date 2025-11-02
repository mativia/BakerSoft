import PropTypes from 'prop-types';
import clsx from 'clsx';
import '../styles/ConsultaProducto.css';

function MensajeResultados({ term, estados, categorias, total }) {
  if (!term && estados.length === 0 && categorias.length === 0) {
    return null;
  }

  const summary = [
    term ? `"${term}"` : null,
    estados.length ? estados.join(', ') : null,
    categorias.length ? categorias.join(', ') : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={clsx('ctp-result-message', { 'ctp-result-message-empty': total === 0 })}>
      {total > 0 ? `Mostrando ${total} resultado${total === 1 ? '' : 's'} para ${summary}` : `Sin coincidencias para ${summary}`}
    </div>
  );
}

MensajeResultados.propTypes = {
  term: PropTypes.string,
  estados: PropTypes.arrayOf(PropTypes.string),
  categorias: PropTypes.arrayOf(PropTypes.string),
  total: PropTypes.number.isRequired,
};

MensajeResultados.defaultProps = {
  term: '',
  estados: [],
  categorias: [],
};

export default MensajeResultados;

