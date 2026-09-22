// src/components/Common/SelectPersonnalise.jsx
import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaChevronDown } from 'react-icons/fa';

const DROPDOWN_MAX_HEIGHT = 220;
const DROPDOWN_GAP = 8;
const DROPDOWN_Z_INDEX = 100000;

function SelectPersonnalise({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  label,
  className = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const listRef = useRef(null);
  const [position, setPosition] = useState(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inside =
        containerRef.current?.contains(event.target) ||
        listRef.current?.contains(event.target);
      if (!inside) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Positionner le dropdown en portail + recalcul au scroll/resize
  useLayoutEffect(() => {
    if (!isOpen) return;

    const computePosition = () => {
      const header = headerRef.current;
      if (!header) return;
      const rect = header.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_GAP;
      let top;
      let maxHeight;
      if (spaceBelow >= DROPDOWN_MAX_HEIGHT) {
        top = rect.bottom + DROPDOWN_GAP;
        maxHeight = DROPDOWN_MAX_HEIGHT;
      } else {
        maxHeight = Math.min(
          DROPDOWN_MAX_HEIGHT,
          Math.max(120, rect.top - DROPDOWN_GAP),
        );
        top = rect.top - DROPDOWN_GAP - maxHeight;
      }
      setPosition({ top, left: rect.left, width: rect.width, maxHeight });
    };

    computePosition();
    window.addEventListener('scroll', computePosition, true);
    window.addEventListener('resize', computePosition);
    return () => {
      window.removeEventListener('scroll', computePosition, true);
      window.removeEventListener('resize', computePosition);
    };
  }, [isOpen]);

  // Trouver le label de l'option sélectionnée
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`select-personnalise ${className}`} ref={containerRef}>
      {label && <label className="select-personnalise-label">{label}</label>}
      
      <div
        ref={headerRef}
        className={`select-personnalise-header ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="select-personnalise-value">{displayLabel}</span>
        <FaChevronDown className={`select-personnalise-icon ${isOpen ? 'rotate' : ''}`} />
      </div>

      {isOpen && !disabled && position && createPortal(
        <ul
          className="select-personnalise-dropdown"
          ref={listRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: position.width,
            maxHeight: position.maxHeight,
            zIndex: DROPDOWN_Z_INDEX,
          }}
        >
          {options.length === 0 ? (
            <li className="select-personnalise-empty">Aucune option disponible</li>
          ) : (
            options.map((option) => (
              <li
                key={option.value}
                className={`select-personnalise-item ${option.value === value ? 'active' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.icon && <span className="select-personnalise-item-icon">{option.icon}</span>}
                <span className="select-personnalise-item-label">{option.label}</span>
                {option.value === value && (
                  <span className="select-personnalise-item-check">✓</span>
                )}
              </li>
            ))
          )}
        </ul>,
        document.body,
      )}
    </div>
  );
}

export default SelectPersonnalise;