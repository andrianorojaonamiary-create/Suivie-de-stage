// src/components/Common/SelectPersonnalise.jsx
import { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

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
  const dropdownRef = useRef(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trouver le label de l'option sélectionnée
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`select-personnalise ${className}`} ref={dropdownRef}>
      {label && <label className="select-personnalise-label">{label}</label>}
      
      <div 
        className={`select-personnalise-header ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="select-personnalise-value">{displayLabel}</span>
        <FaChevronDown className={`select-personnalise-icon ${isOpen ? 'rotate' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <ul className="select-personnalise-dropdown">
          {options.map((option) => (
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
          ))}
        </ul>
      )}
    </div>
  );
}

export default SelectPersonnalise;