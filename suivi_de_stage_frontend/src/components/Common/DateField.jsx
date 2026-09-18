import { registerLocale } from "react-datepicker";
import DatePicker from "react-datepicker";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-theme.css";

registerLocale("fr", fr);

const ISO_FORMAT = "yyyy-MM-dd";
const FR_FORMAT = "dd/MM/yyyy";

const parseIso = (iso) => {
  if (!iso) return null;
  const date = parse(iso, ISO_FORMAT, new Date(0));
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Champ de date au format français JJ/MM/AAAA avec calendrier (react-datepicker,
 * locale fr). La valeur échangée avec le formulaire reste en ISO (AAAA-MM-JJ).
 */
function DateField({ value, onChange, name, required, disabled, className, id, placeholder }) {
  const handleChange = (date) => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: date ? format(date, ISO_FORMAT) : "",
        },
      });
    }
  };

  return (
    <DatePicker
      selected={parseIso(value)}
      onChange={handleChange}
      dateFormat={FR_FORMAT}
      locale="fr"
      placeholderText={placeholder || "JJ/MM/AAAA"}
      name={name}
      required={required}
      disabled={disabled}
      className={className}
      id={id}
      isClearable
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      portalId="emit-datepicker-portal"
    />
  );
}

export default DateField;