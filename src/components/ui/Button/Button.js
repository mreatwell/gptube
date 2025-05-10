import React from "react";
// import styles from './Button.module.css'; // Uncomment if using CSS Modules

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary", // 'primary', 'secondary', 'text', 'icon'
  disabled = false,
  className = "", // Allow custom classes
  // Add other props like 'aria-label' for icon buttons, etc.
  ...props
}) => {
  // Basic style (can be replaced with CSS Modules or a styling library)
  const baseStyle = {
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s ease, opacity 0.2s ease",
  };

  const variantStyles = {
    primary: {
      backgroundColor: "#0070f3",
      color: "white",
    },
    secondary: {
      backgroundColor: "#eaeaea",
      color: "#333",
      border: "1px solid #ccc",
    },
    text: {
      backgroundColor: "transparent",
      color: "#0070f3",
      padding: "10px 5px",
    },
    icon: {
      backgroundColor: "transparent",
      padding: "5px",
      border: "none",
    },
  };

  const disabledStyle = {
    opacity: 0.6,
    cursor: "not-allowed",
  };

  const style = {
    ...baseStyle,
    ...variantStyles[variant],
    ...(disabled ? disabledStyle : {}),
  };

  // Add hover/focus styles dynamically or via CSS classes if using CSS Modules

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style} // Apply combined styles
      className={`btn btn-${variant} ${className}`} // Basic class names for potential global styling or testing
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
