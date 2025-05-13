import React, { useState, useRef, useEffect } from "react";

const spinner = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 50 50"
    style={{ verticalAlign: "middle" }}
    aria-hidden="true"
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke="var(--color-button-text)"
      strokeWidth="5"
      strokeDasharray="31.4 31.4"
      strokeLinecap="round"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

// YouTube URL regex (supports standard, short, embed)
const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)[\w-]{11}([&?].*)?$/i;

const UrlInputForm = ({ onSubmit, isLoading, apiError }) => {
  const [url, setUrl] = useState("");
  const [btnStyle, setBtnStyle] = useState({});
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const loadingLiveRef = useRef(null);

  // Autofocus on mount (mobile-friendly)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Real-time validation
  useEffect(() => {
    if (!url) {
      setError("");
    } else if (!YT_REGEX.test(url)) {
      setError("Please enter a valid YouTube URL.");
    } else {
      setError("");
    }
  }, [url]);

  // Announce loading state to screen readers
  useEffect(() => {
    if (isLoading && loadingLiveRef.current) {
      loadingLiveRef.current.textContent = "Processing video, please wait...";
    } else if (loadingLiveRef.current) {
      loadingLiveRef.current.textContent = "";
    }
  }, [isLoading]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!url || isLoading) return;
    if (!YT_REGEX.test(url)) {
      setError("Please enter a valid YouTube URL.");
      return;
    }
    setError("");
    onSubmit(url);
  };

  // Button base style
  const baseBtnStyle = {
    padding: "0.75rem 1.5rem",
    fontSize: "1.1rem",
    border: "none",
    borderRadius: "8px",
    background:
      isLoading || !url || error
        ? "var(--color-muted)"
        : "var(--color-primary)",
    color: "var(--color-button-text)",
    cursor: isLoading || !url || error ? "not-allowed" : "pointer",
    fontWeight: 600,
    boxShadow: "0 2px 8px rgba(179, 157, 219, 0.08)",
    transition: "background 0.2s, box-shadow 0.2s, outline 0.2s",
    minHeight: "44px",
    outline: isLoading ? "2px solid var(--color-muted)" : "none",
    ...btnStyle,
  };

  // Show only one error at a time: validation error takes precedence
  const displayError = error || apiError;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        alignItems: "stretch",
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
      }}
      aria-label="YouTube URL submission form"
    >
      <label
        htmlFor="youtube-url"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        YouTube URL
      </label>
      <input
        id="youtube-url"
        ref={inputRef}
        type="url"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          if (error) setError(""); // Clear error on new input
        }}
        placeholder="Paste YouTube URL here"
        required
        disabled={isLoading}
        autoFocus
        aria-label="YouTube URL"
        aria-required="true"
        aria-disabled={isLoading}
        aria-describedby={displayError ? "url-error" : undefined}
        style={{
          padding: "0.75rem 1rem",
          fontSize: "1.1rem",
          border: displayError
            ? "1.5px solid #d32f2f"
            : "1.5px solid var(--color-border)",
          borderRadius: "8px",
          background: isLoading ? "#f3f3f3" : "#fff",
          color: "var(--color-text)",
          outline: isLoading ? "2px solid var(--color-muted)" : "none",
          boxShadow: "0 1px 4px rgba(35,66,54,0.04)",
          transition: "border 0.2s, box-shadow 0.2s, outline 0.2s",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
        onFocus={(e) =>
          (e.target.style.border = displayError
            ? "1.5px solid #d32f2f"
            : "1.5px solid var(--color-primary)")
        }
        onBlur={(e) =>
          (e.target.style.border = displayError
            ? "1.5px solid #d32f2f"
            : "1.5px solid var(--color-border)")
        }
        inputMode="url"
        pattern="https?://(www\.)?(youtube\.com|youtu\.be)/.+"
      />
      {displayError && (
        <div
          id="url-error"
          style={{
            color: error ? "#d32f2f" : "#b26a00",
            fontSize: "0.98rem",
            marginTop: "-0.5rem",
            marginBottom: "0.25rem",
          }}
          role="alert"
          aria-live="polite"
        >
          {displayError}
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading || !url || !!displayError}
        style={baseBtnStyle}
        aria-disabled={isLoading || !url || !!displayError}
        aria-busy={isLoading}
        onMouseEnter={() =>
          !isLoading &&
          url &&
          !displayError &&
          setBtnStyle({
            background: "var(--color-button)",
            boxShadow: "0 4px 16px rgba(35, 66, 54, 0.10)",
          })
        }
        onMouseLeave={() => setBtnStyle({})}
        onFocus={() =>
          !isLoading &&
          url &&
          !displayError &&
          setBtnStyle({
            background: "var(--color-button)",
            outline: "2px solid var(--color-primary)",
          })
        }
        onBlur={() => setBtnStyle({})}
        onMouseDown={() =>
          !isLoading &&
          url &&
          !displayError &&
          setBtnStyle({
            background: "var(--color-primary)",
            boxShadow: "0 1px 2px rgba(35, 66, 54, 0.10)",
          })
        }
        onMouseUp={() =>
          setBtnStyle({
            background: "var(--color-button)",
            boxShadow: "0 4px 16px rgba(35, 66, 54, 0.10)",
          })
        }
      >
        {isLoading ? (
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <span role="status" aria-live="polite">
              {spinner} Processing...
            </span>
          </span>
        ) : (
          "Process Video"
        )}
      </button>
      {/* Visually hidden live region for loading state */}
      <div
        ref={loadingLiveRef}
        style={{
          position: "absolute",
          left: "-9999px",
          height: 1,
          width: 1,
          overflow: "hidden",
        }}
        aria-live="polite"
        role="status"
      />
    </form>
  );
};

export default UrlInputForm;
