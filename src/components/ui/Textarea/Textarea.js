import React from "react";
// import styles from './Textarea.module.css'; // Uncomment if using CSS Modules

const Textarea = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  name,
  rows = 3, // Default number of rows
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
    fontFamily: "inherit", // Ensure textarea uses the same font as other inputs
    resize: "vertical", // Allow vertical resizing, can be set to 'none' or 'both'
    ...(disabled ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}),
  };

  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      style={style}
      className={`form-textarea ${className}`} // Basic class names for potential global styling or testing
      {...props}
    />
  );
};

export default Textarea;
