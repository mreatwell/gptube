import React, { useState } from "react";

const UrlInputForm = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!url || isLoading) return; // Prevent submission if loading or URL is empty
    // Basic URL validation (can be improved)
    if (!url.includes("youtube.com/") && !url.includes("youtu.be/")) {
      alert("Please enter a valid YouTube URL.");
      return;
    }
    onSubmit(url); // Pass the URL up to the parent component
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter YouTube URL (e.g., https://www.youtube.com/...)"
        required
        disabled={isLoading}
        style={{ padding: "10px", width: "400px", maxWidth: "80%" }}
      />
      <button
        type="submit"
        disabled={isLoading || !url}
        style={{
          padding: "10px 20px",
          cursor: isLoading || !url ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Processing..." : "Process Video"}
      </button>
    </form>
  );
};

export default UrlInputForm;
