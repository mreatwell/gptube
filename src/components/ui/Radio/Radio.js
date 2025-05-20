import React from "react";
// import styles from './Radio.module.css'; // Uncomment if using CSS Modules

const Radio = ({
  label,
  checked,
  onChange,
  disabled = false,
  name,
  id, // Important for label association
  value,
  className = "",
  // Add other props like 'aria-describedby' for additional help text
  ...props
}) => {
  // Basic style (can be replaced with CSS Modules or a styling library)
  const wrapperStyle = {
    display: "flex",
    alignItems: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    marginBottom: "10px", // Example spacing
  };

  const inputStyle = {
    marginRight: "8px",
    cursor: "inherit",
    width: "16px", // Consistent sizing
    height: "16px",
  };

  const labelStyle = {
    fontSize: "1rem",
    color: disabled ? "#666" : "#333",
    cursor: "inherit",
  };

  return (
    <div style={wrapperStyle} className={`radio-wrapper ${className}`}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={inputStyle}
        {...props}
      />
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
      )}
    </div>
  );
};

export default Radio;
