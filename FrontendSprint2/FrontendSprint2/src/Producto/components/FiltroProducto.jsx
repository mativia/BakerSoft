import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import '../styles/ConsultaProducto.css';

function FiltroProducto({ selectedEstados, selectedCategorias, onChange }) {
  const [open, setOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);
  const POP_WIDTH = 240;

  const toggleOption = (type, value) => {
    if (type === 'estado') {
      const nextEstados = selectedEstados.includes(value)
        ? selectedEstados.filter((item) => item !== value)
        : [...selectedEstados, value];
      onChange(nextEstados, selectedCategorias);
    } else {
      const nextCategorias = selectedCategorias.includes(value)
        ? selectedCategorias.filter((item) => item !== value)
        : [...selectedCategorias, value];
      onChange(selectedEstados, nextCategorias);
    }
  };

  const updatePopoverPosition = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const desiredLeft = rect.right + window.scrollX - POP_WIDTH;
    const left = Math.max(16, Math.min(desiredLeft, viewportWidth + window.scrollX - POP_WIDTH - 16));
    const top = rect.bottom + window.scrollY + 12;
    setPopoverPosition({ top, left });
  }, [POP_WIDTH]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    updatePopoverPosition();

    const handleWindowUpdates = () => updatePopoverPosition();

    window.addEventListener('resize', handleWindowUpdates);
    window.addEventListener('scroll', handleWindowUpdates, true);

    return () => {
      window.removeEventListener('resize', handleWindowUpdates);
      window.removeEventListener('scroll', handleWindowUpdates, true);
    };
  }, [open, updatePopoverPosition]);

  const estadoOptions = ['Activo', 'Inactivo'];
  const categoriaOptions = ['Panadería', 'Pastelería'];

  return (
    <div className="ctp-filter">
      <button
        type="button"
        className={clsx('ctp-filter-button', { 'ctp-filter-button-active': open || selectedEstados.length || selectedCategorias.length })}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Abrir filtros de productos"
        ref={triggerRef}
      >
        Filtros
      </button>

      {open ? (
        createPortal(
          <div
            className="ctp-popover"
            ref={popoverRef}
            role="menu"
            style={{ top: popoverPosition.top, left: popoverPosition.left, minWidth: POP_WIDTH }}
          >
            <p className="ctp-popover-title">Filtrar por:</p>
            <div className="ctp-popover-section">
              <span className="ctp-popover-label">Estado</span>
              <div className="ctp-popover-options">
                {estadoOptions.map((estado) => (
                  <label key={estado} className="ctp-popover-option">
                    <input
                      type="checkbox"
                      checked={selectedEstados.includes(estado)}
                      onChange={() => toggleOption('estado', estado)}
                    />
                    <span>{estado}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="ctp-popover-section">
              <span className="ctp-popover-label">Categoría</span>
              <div className="ctp-popover-options">
                {categoriaOptions.map((categoria) => (
                  <label key={categoria} className="ctp-popover-option">
                    <input
                      type="checkbox"
                      checked={selectedCategorias.includes(categoria)}
                      onChange={() => toggleOption('categoria', categoria)}
                    />
                    <span>{categoria}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )
      ) : null}
    </div>
  );
}

FiltroProducto.propTypes = {
  selectedEstados: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCategorias: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FiltroProducto;