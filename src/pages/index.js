import React, { useState } from "react";
import UrlInputForm from "../components/UrlInputForm"; // Import the component
import Button from "../components/ui/Button/Button"; // Import the new Button component
import Radio from "../components/ui/Radio/Radio"; // Import the Radio component
import Select from "../components/ui/Select/Select"; // Import the Select component
import Modal from "../components/ui/Modal/Modal"; // Import the Modal component

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null); // New: status from API
  const [apiMessage, setApiMessage] = useState(""); // New: message from API
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState("option1"); // For radio group
  const [selectedDropdown, setSelectedDropdown] = useState(""); // For select dropdown
  const [isModalOpen, setIsModalOpen] = useState(false); // For modal demo
  const [transcript, setTranscript] = useState(""); // New: state for transcript
  const [summary, setSummary] = useState(""); // New: state for summary
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState("");
  const [chunks, setChunks] = useState([]); // Store transcript chunks for Q&A
  const [steps, setSteps] = useState("");
  const [stepsLoading, setStepsLoading] = useState(false);
  const [stepsError, setStepsError] = useState("");
  const [stepsShowMore, setStepsShowMore] = useState(false);

  // Placeholder function to handle form submission
  const handleUrlSubmit = async (url) => {
    console.log("Submitted URL:", url);
    setIsLoading(true);
    setVideoId(null);
    setVideoStatus(null);
    setApiMessage("");
    setError(null);

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unknown error from API");
      }
      setVideoId(data.videoId);
      setVideoStatus(data.status);
      setApiMessage(data.message || "");
      setTranscript(data.transcript || "");
      setSummary(data.summary || "");
      setChunks(data.chunks || []); // Store chunks for Q&A
    } catch (err) {
      console.error("Error submitting URL:", err);
      setError(
        err.message || "Failed to process URL. Please check the format."
      );
      setSummary("");
      setChunks([]);
    } finally {
      setIsLoading(false);
    }
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

      {/* Modal demo */}
      <div
        style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
      >
        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Modal Title</h2>
        <p>This is a demo modal. Click outside or press Escape to close.</p>
        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>

      {error && (
        <p style={{ color: "red", marginTop: "15px" }}>Error: {error}</p>
      )}

      {videoId && !isLoading && (
        <div style={{ color: "green", marginTop: "15px" }}>
          <p>
            Processing started for video ID: <b>{videoId}</b>.<br />
            Status: <b>{videoStatus}</b>
          </p>
          {apiMessage && <p>{apiMessage}</p>}
          {/* Summary display */}
          {summary && (
            <div
              style={{
                margin: "24px auto 0",
                maxWidth: 700,
                background: "#e8f4ff",
                color: "#1a2a3a",
                padding: 20,
                borderRadius: 8,
                border: "1px solid #b6d6f6",
                textAlign: "left",
                fontSize: 17,
                lineHeight: 1.7,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#1976d2" }}>AI Summary</h3>
              <div style={{ whiteSpace: "pre-wrap" }}>{summary}</div>
            </div>
          )}
          {/* End summary display */}
          {/* Transcript display */}
          {apiMessage === "Transcript found." && apiMessage && (
            <div
              style={{
                marginTop: 20,
                maxHeight: 300,
                overflowY: "auto",
                background: "#f9f9f9",
                color: "#222",
                padding: 16,
                borderRadius: 8,
                border: "1px solid #eee",
                textAlign: "left",
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              <h3 style={{ marginTop: 0 }}>Transcript</h3>
              <div style={{ whiteSpace: "pre-wrap" }}>{transcript}</div>
            </div>
          )}
          {/* End transcript display */}
          {/* Q&A section */}
          {transcript && (
            <div
              style={{
                margin: "32px auto 0",
                maxWidth: 700,
                textAlign: "left",
              }}
            >
              <h3 style={{ color: "#1976d2", marginBottom: 8 }}>
                Ask a question about this video
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setQaLoading(true);
                  setQaError("");
                  setQaAnswer("");
                  try {
                    const res = await fetch("/api/videos-qa", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ chunks, question: qaQuestion }),
                    });
                    const data = await res.json();
                    if (!res.ok)
                      throw new Error(
                        data.error || "Unknown error from Q&A API"
                      );
                    setQaAnswer(data.answer || "No answer returned.");
                  } catch (err) {
                    setQaError(err.message || "Failed to get answer.");
                  } finally {
                    setQaLoading(false);
                  }
                }}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <input
                  type="text"
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="Type your question..."
                  style={{
                    flex: 1,
                    padding: 8,
                    fontSize: 16,
                    borderRadius: 4,
                    border: "1px solid #b6d6f6",
                  }}
                  disabled={qaLoading}
                  required
                />
                <Button
                  type="submit"
                  disabled={qaLoading || !qaQuestion.trim()}
                  style={{ minWidth: 100 }}
                >
                  {qaLoading ? "Asking..." : "Ask"}
                </Button>
              </form>
              {qaError && (
                <div style={{ color: "red", marginBottom: 8 }}>{qaError}</div>
              )}
              {qaAnswer && (
                <div
                  style={{
                    background: "#fffbe8",
                    color: "#7a5d00",
                    padding: 16,
                    borderRadius: 8,
                    border: "1px solid #ffe082",
                    fontSize: 16,
                    lineHeight: 1.6,
                    marginTop: 4,
                  }}
                >
                  <b>AI Answer:</b>
                  <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                    {qaAnswer}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* End Q&A section */}
          {/* Steps extraction section */}
          {transcript && (
            <div
              style={{
                margin: "32px auto 0",
                maxWidth: 700,
                textAlign: "left",
              }}
            >
              <Button
                onClick={async () => {
                  setStepsLoading(true);
                  setStepsError("");
                  setStepsShowMore(false);
                  try {
                    const res = await fetch("/api/videos-steps", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ transcript }),
                    });
                    const data = await res.json();
                    if (!res.ok)
                      throw new Error(
                        data.error || "Unknown error from steps API"
                      );
                    setSteps(data.steps || "No steps found.");
                    setStepsShowMore(data.cutoff || false);
                  } catch (err) {
                    setStepsError(err.message || "Failed to extract steps.");
                  } finally {
                    setStepsLoading(false);
                  }
                }}
                disabled={stepsLoading}
                style={{ marginBottom: 12 }}
              >
                {stepsLoading
                  ? "Extracting steps..."
                  : "Extract all steps from this video"}
              </Button>
              {stepsError && (
                <div style={{ color: "red", marginBottom: 8 }}>
                  {stepsError}
                </div>
              )}
              {steps && (
                <div
                  style={{
                    background: "#f1f8e9",
                    color: "#2e4d1c",
                    padding: 16,
                    borderRadius: 8,
                    border: "1px solid #c5e1a5",
                    fontSize: 16,
                    lineHeight: 1.7,
                    marginTop: 4,
                    maxHeight: 350,
                    overflowY: "auto",
                  }}
                >
                  <b>Extracted Steps:</b>
                  <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                    {steps}
                  </div>
                  {stepsShowMore && (
                    <Button
                      onClick={async () => {
                        setStepsLoading(true);
                        setStepsError("");
                        try {
                          const res = await fetch("/api/videos-steps", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              transcript,
                              continueFrom: steps,
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok)
                            throw new Error(
                              data.error || "Unknown error from steps API"
                            );
                          setSteps(steps + "\n" + (data.steps || ""));
                          setStepsShowMore(data.cutoff || false);
                        } catch (err) {
                          setStepsError(
                            err.message || "Failed to extract more steps."
                          );
                        } finally {
                          setStepsLoading(false);
                        }
                      }}
                      disabled={stepsLoading}
                      style={{ marginTop: 12 }}
                    >
                      {stepsLoading ? "Loading more..." : "Show more"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
          {/* End steps extraction section */}
          {/* Placeholder for results display component */}
        </div>
      )}
    </div>
  );
};

export default HomePage;
