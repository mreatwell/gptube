import React, { useState } from "react";
import UrlInputForm from "../components/UrlInputForm"; // Import the component
import Button from "../components/ui/Button/Button"; // Import the new Button component
import Radio from "../components/ui/Radio/Radio"; // Import the Radio component
import Select from "../components/ui/Select/Select"; // Import the Select component

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState("option1"); // For radio group
  const [selectedDropdown, setSelectedDropdown] = useState(""); // For select dropdown

  // Placeholder function to handle form submission
  const handleUrlSubmit = async (url) => {
    console.log("Submitted URL:", url);
    setIsLoading(true);
    setVideoId(null);
    setError(null);

    // --- TODO: Implement API call to POST /api/videos ---
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
      // Extract video ID (basic example, needs improvement for robustness)
      const urlParams = new URLSearchParams(new URL(url).search);
      const id = urlParams.get("v") || url.split("/").pop().split("?")[0];

      if (!id) {
        throw new Error("Could not extract video ID from URL.");
      }

      console.log("Extracted Video ID:", id);
      setVideoId(id);
      // In a real scenario, the API would return the videoId and initial status
      // We would then start polling GET /api/videos/{id} or use WebSockets
    } catch (err) {
      console.error("Error submitting URL:", err);
      setError(
        err.message || "Failed to process URL. Please check the format."
      );
    } finally {
      setIsLoading(false);
    }
    // --- End of TODO ---
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to gptube - YouTube Tutorial Companion</h1>
      <p>Submit a YouTube URL to get started!</p>

      <UrlInputForm onSubmit={handleUrlSubmit} isLoading={isLoading} />

      {/* Add the new button here for testing */}
      <div style={{ marginTop: "20px" }}>
        <Button onClick={() => alert("Primary button clicked!")}>
          Primary Button
        </Button>
        <Button variant="secondary" style={{ marginLeft: "10px" }}>
          Secondary
        </Button>
        <Button variant="text" style={{ marginLeft: "10px" }}>
          Text Button
        </Button>
        <Button disabled style={{ marginLeft: "10px" }}>
          Disabled
        </Button>
      </div>

      {/* Radio group example */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <Radio
          id="radio1"
          name="exampleGroup"
          label="Option 1"
          value="option1"
          checked={selectedOption === "option1"}
          onChange={() => setSelectedOption("option1")}
        />
        <Radio
          id="radio2"
          name="exampleGroup"
          label="Option 2"
          value="option2"
          checked={selectedOption === "option2"}
          onChange={() => setSelectedOption("option2")}
        />
        <Radio
          id="radio3"
          name="exampleGroup"
          label="Disabled"
          value="option3"
          checked={selectedOption === "option3"}
          onChange={() => setSelectedOption("option3")}
          disabled
        />
      </div>

      {/* Select dropdown example */}
      <div
        style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
      >
        <Select
          name="exampleSelect"
          value={selectedDropdown}
          onChange={(e) => setSelectedDropdown(e.target.value)}
          options={[
            { value: "apple", label: "Apple" },
            { value: "banana", label: "Banana" },
            { value: "orange", label: "Orange" },
            { value: "disabled", label: "Disabled Option", disabled: true },
          ]}
          placeholder="Choose a fruit"
        />
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "15px" }}>Error: {error}</p>
      )}

      {videoId && !isLoading && (
        <p style={{ color: "green", marginTop: "15px" }}>
          Processing started for video ID: {videoId}. Fetching results...
        </p>
        /* Placeholder for results display component */
      )}
    </div>
  );
};

export default HomePage;
