import React, { useEffect } from "react";
// import styles from './Modal.module.css'; // Uncomment if using CSS Modules

const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  backdropClassName = "",
  // Add other props like aria-label, size, etc.
  ...props
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Basic styles (replace with CSS Modules or styled-components as needed)
  const backdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.4)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const modalStyle = {
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
    padding: "24px",
    minWidth: "320px",
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflowY: "auto",
    zIndex: 1001,
  };

  // Prevent click inside modal from closing
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      style={backdropStyle}
      className={`modal-backdrop ${backdropClassName}`}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        style={modalStyle}
        className={`modal-content ${className}`}
        onClick={handleModalClick}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
