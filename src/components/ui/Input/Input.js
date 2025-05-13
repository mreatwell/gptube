import React from "react";
// import styles from './Input.module.css'; // Uncomment if using CSS Modules

const Input = ({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  name,
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
    width: "100%", // Default to full width, can be overridden by parent or className
    boxSizing: "border-box", // Important for width calculation with padding/border
    ...(disabled ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}),
  };

  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={style}
      className={`form-input ${className}`} // Basic class names for potential global styling or testing
      {...props}
    />
  );
};

export default Input;
