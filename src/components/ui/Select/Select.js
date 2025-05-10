import React from "react";
// import styles from './Select.module.css'; // Uncomment if using CSS Modules

const Select = ({
  options = [],
  value,
  onChange,
  disabled = false,
  name,
  placeholder = "Select an option",
  className = "",
  // Add other props like 'aria-label', 'required', etc.
  ...props
}) => {
  // Basic style (can be replaced with CSS Modules or a styling library)
  const style = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "1rem",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: disabled ? "#f0f0f0" : "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
  };

  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={style}
      className={`form-select ${className}`}
      {...props}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
