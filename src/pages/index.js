import React, { useState, useRef, useEffect } from "react";
import UrlInputForm from "../components/UrlInputForm"; // Import the component
import Button from "../components/ui/Button/Button"; // Import the new Button component
import Radio from "../components/ui/Radio/Radio"; // Import the Radio component
import Select from "../components/ui/Select/Select"; // Import the Select component
import Modal from "../components/ui/Modal/Modal"; // Import the Modal component

const Card = ({ children, style = {}, ...props }) => (
  <div
    style={{
      background: "var(--color-surface, #f8f6ff)",
      color: "var(--color-text, #222)",
      borderRadius: "1rem",
      boxShadow: "0 2px 12px rgba(179,157,219,0.10)",
      border: "1px solid var(--color-border, #e0e0e0)",
      padding: "1.25rem 1rem",
      margin: "1.5rem auto 0",
      maxWidth: 700,
      width: "100%",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const Feedback = ({ type, message }) => {
  if (!message) return null;
  let color = "#388e3c",
    icon = "✅";
  if (type === "error") {
    color = "#d32f2f";
    icon = "❌";
  }
  if (type === "warn") {
    color = "#b26a00";
    icon = "⚠️";
  }
  return (
    <div
      style={{
        color,
        fontWeight: 500,
        margin: "1rem 0",
        fontSize: "1.08rem",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true">{icon}</span> <span>{message}</span>
    </div>
  );
};

const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 700);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

const useCopy = (text) => {
  const [copied, setCopied] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);
  const copy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setShowManualCopy(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setShowManualCopy(true);
    }
  };
  return [copied, copy, showManualCopy, setShowManualCopy];
};

// Helper: parse timestamps and return seconds
const parseTimestamp = (str) => {
  const parts = str.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

// Helper: linkify timestamps in text
const linkifyTimestamps = (text, onClick) => {
  if (!text) return null;
  const regex = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;
  const parts = [];
  let lastIdx = 0;
  let match;
  let idx = 0;
  while ((match = regex.exec(text))) {
    const [ts] = match;
    const start = match.index;
    if (start > lastIdx) parts.push(text.slice(lastIdx, start));
    parts.push(
      <button
        key={`ts-${idx++}`}
        onClick={() => onClick(parseTimestamp(ts))}
        style={{
          color: "#6c4f99",
          textDecoration: "underline",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "inherit",
          padding: 0,
        }}
        aria-label={`Jump to ${ts}`}
      >
        {ts}
      </button>
    );
    lastIdx = start + ts.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
};

const getHistoryFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("gptube_history") || "[]");
  } catch {
    return [];
  }
};

const saveHistoryToStorage = (history) => {
  localStorage.setItem("gptube_history", JSON.stringify(history));
};

const HistorySidebar = ({
  history,
  onSelect,
  onRemove,
  onClear,
  open,
  setOpen,
  isMobile,
}) => (
  <aside
    style={{
      position: isMobile ? "fixed" : "sticky",
      top: 0,
      left: isMobile ? (open ? 0 : "-100vw") : 0,
      width: isMobile ? "80vw" : 260,
      height: isMobile ? "100vh" : "100vh",
      background: "#f8f6ff",
      borderRight: "1px solid #e0e0e0",
      boxShadow: isMobile && open ? "2px 0 12px rgba(0,0,0,0.10)" : "none",
      zIndex: 100,
      transition: "left 0.3s cubic-bezier(.4,0,.2,1)",
      padding: 0,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
    }}
    aria-label="Video history"
  >
    <div
      style={{
        padding: "1rem 1rem 0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <b style={{ fontSize: "1.1rem" }}>History</b>
      {isMobile && (
        <button
          onClick={() => setOpen(false)}
          aria-label="Close history"
          style={{
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      )}
    </div>
    <div style={{ flex: 1, overflowY: "auto" }}>
      {history.length === 0 && (
        <div style={{ padding: "1rem", color: "#888" }}>No history yet.</div>
      )}
      {history.map((item, i) => (
        <div
          key={item.videoId + i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0.7rem 1rem",
            borderBottom: "1px solid #eee",
            cursor: "pointer",
            background: item.selected ? "#e0e7ff" : "none",
          }}
          onClick={() => onSelect(item)}
          tabIndex={0}
          aria-label={`Load video ${item.title || item.videoId}`}
        >
          <img
            src={item.thumbnail}
            alt="Video thumbnail"
            style={{
              width: 48,
              height: 36,
              objectFit: "cover",
              borderRadius: 4,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.title || item.videoId}
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>{item.date}</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.videoId);
            }}
            aria-label="Remove from history"
            style={{
              background: "none",
              border: "none",
              color: "#d32f2f",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
    {history.length > 0 && (
      <button
        onClick={onClear}
        style={{
          margin: "1rem",
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 6,
          padding: "0.5em 1em",
          color: "#d32f2f",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Clear All
      </button>
    )}
  </aside>
);

// Utility to export text as a .txt file
const exportText = (text, filename) => {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};

// Component to display links from the transcript
const LinksCard = ({ links = [], title = "Links from Video" }) => {
  if (!links || links.length === 0) return null;

  // Display hostname for better readability
  const getDisplayUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}${urlObj.pathname.replace(/\/$/, "")}`;
    } catch {
      return url;
    }
  };

  return (
    <Card style={{ marginTop: "1rem" }}>
      <h3 style={{ margin: "0 0 0.8rem", fontSize: "1.1rem", fontWeight: 600 }}>
        {title}
      </h3>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {links.map((link, i) => (
          <li
            key={`link-${i}`}
            style={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#6c4f99",
                textDecoration: "none",
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              <span style={{ flexShrink: 0 }}>🔗</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {getDisplayUrl(link)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null); // New: status from API
  const [apiMessage, setApiMessage] = useState(""); // New: message from API
  const [error, setError] = useState(null);
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
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [qaOpen, setQaOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [playerKey, setPlayerKey] = useState(0); // force iframe reload
  const [playerTime, setPlayerTime] = useState(0);
  const videoRef = useRef();
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const isMobile = useMobile();
  const [videoLinks, setVideoLinks] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(getHistoryFromStorage());
  }, []);

  // Save history to localStorage on change
  useEffect(() => {
    saveHistoryToStorage(history);
  }, [history]);

  // Add to history after successful video processing
  const addToHistory = (data) => {
    if (!data?.videoId) return;
    const newItem = {
      videoId: data.videoId,
      url: url,
      title: data?.metadata?.snippet?.title,
      thumbnail: data?.metadata?.snippet?.thumbnails?.default?.url,
      date: new Date().toLocaleDateString(),
      videoData: data?.metadata?.snippet,
      transcript: data.transcript,
      summary: data.summary,
      steps: stepsResults,
      qaResults,
      links: data.links || [], // Save links to history
      selected: true,
    };

    const updatedHistory = [
      newItem,
      ...history
        .filter((i) => i.videoId !== data.videoId)
        .map((i) => ({ ...i, selected: false })),
    ].slice(0, 50); // Limit to 50 items

    setHistory(updatedHistory);
    saveHistoryToStorage(updatedHistory);
  };

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
      setVideoLinks(data.links || []);
      addToHistory(data);
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

  // Helper for feedback type
  const getFeedbackType = () => {
    if (error)
      return error.toLowerCase().includes("unavailable") ? "warn" : "error";
    if (apiMessage && apiMessage.toLowerCase().includes("found"))
      return "success";
    return null;
  };

  // Copy hooks
  const [summaryCopied, copySummary, summaryManualCopy, setSummaryManualCopy] =
    useCopy(summary);
  const [
    transcriptCopied,
    copyTranscript,
    transcriptManualCopy,
    setTranscriptManualCopy,
  ] = useCopy(transcript);
  const [qaCopied, copyQa, qaManualCopy, setQaManualCopy] = useCopy(qaAnswer);
  const [stepsCopied, copySteps, stepsManualCopy, setStepsManualCopy] =
    useCopy(steps);

  // When a new video is processed, reset player state
  React.useEffect(() => {
    setPlayerTime(0);
    setPlayerKey((k) => k + 1);
  }, [videoId]);

  // Helper: Seek video by updating iframe src
  const seekTo = (seconds) => {
    setPlayerTime(seconds);
    setPlayerKey((k) => k + 1); // force iframe reload
  };

  // Helper: get embed URL with start param and autoplay
  const getEmbedUrl = () => {
    if (!videoId) return "";
    let url = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    if (playerTime > 0) url += `&start=${playerTime}&autoplay=1`;
    else url += `&autoplay=0`;
    return url;
  };

  // Load from history
  const loadFromHistory = (item) => {
    setVideoId(item.videoId);
    setSummary(item.summary || "");
    setTranscript(item.transcript || "");
    setSteps(item.steps || "");
    setChunks(item.chunks || []);
    setApiMessage("Loaded from history.");
    setVideoStatus("history");
    setSummaryOpen(true);
    setTranscriptOpen(false);
    setQaOpen(false);
    setStepsOpen(false);
    setPlayerTime(0);
    setPlayerKey((k) => k + 1);
    setVideoLinks(item.links || []);

    // Update selected status in history
    const updatedHistory = history.map((h) => ({
      ...h,
      selected: h.videoId === item.videoId,
    }));
    setHistory(updatedHistory);
    saveHistoryToStorage(updatedHistory);

    if (isMobile) {
      setHistoryOpen(false);
    }
  };

  // Remove from history
  const removeFromHistory = (videoId) => {
    setHistory((h) => h.filter((item) => item.videoId !== videoId));
  };

  // Clear all history
  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--color-bg, #f9f8fa)",
      }}
    >
      <HistorySidebar
        history={history}
        onSelect={loadFromHistory}
        onRemove={removeFromHistory}
        onClear={clearHistory}
        open={historyOpen}
        setOpen={setHistoryOpen}
        isMobile={isMobile}
      />
      <main style={{ flex: 1, position: "relative" }}>
        {/* Floating Show History button for mobile */}
        {isMobile && !historyOpen && (
          <button
            onClick={() => setHistoryOpen(true)}
            aria-label="Show history"
            style={{
              position: "fixed",
              left: 12,
              bottom: 18,
              zIndex: 101,
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: 24,
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
              padding: "0.7em 1.3em",
              fontWeight: 700,
              color: "#6c4f99",
              fontSize: 17,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span aria-hidden="true">📜</span> History
          </button>
        )}
        {/* Main content */}
        <div
          style={{
            padding: "20px 0",
            textAlign: "center",
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          <h1
            style={{ fontSize: "2.1rem", fontWeight: 700, margin: "0 0 0.5em" }}
          >
            Welcome to gptube - YouTube Tutorial Companion
          </h1>
          <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
            Submit a YouTube URL to get started!
          </p>
          <UrlInputForm
            onSubmit={handleUrlSubmit}
            isLoading={isLoading}
            apiError={error}
          />
          <Feedback type={getFeedbackType()} message={error || apiMessage} />
          {videoId && !isLoading && (
            <div style={{ marginTop: "1.5rem" }}>
              {/* Embedded YouTube Video */}
              <div
                style={{
                  maxWidth: 700,
                  margin: "0 auto 1.5rem",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    overflow: "hidden",
                    borderRadius: 12,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <iframe
                    key={playerKey}
                    ref={videoRef}
                    src={getEmbedUrl()}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                      borderRadius: 12,
                    }}
                  />
                </div>
              </div>
              {/* Display links if available */}
              <LinksCard links={videoLinks} />
              {/* Collapsible Summary Card */}
              <Card>
                <button
                  onClick={() => setSummaryOpen((v) => !v)}
                  aria-expanded={summaryOpen}
                  aria-controls="summary-content"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6c4f99",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {summaryOpen ? "▼" : "►"} AI Summary
                </button>
                {summaryOpen && summary && (
                  <div id="summary-content">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span />
                      <Button
                        onClick={copySummary}
                        size="sm"
                        aria-label="Copy summary"
                        style={{ fontSize: "1rem", padding: "0.3em 0.8em" }}
                      >
                        {summaryCopied ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        onClick={() => exportText(summary, "summary.txt")}
                        size="sm"
                        aria-label="Export summary as .txt"
                        style={{
                          fontSize: "1rem",
                          padding: "0.3em 0.8em",
                          marginLeft: 8,
                        }}
                      >
                        Export
                      </Button>
                    </div>
                    {summaryManualCopy && (
                      <div style={{ marginTop: 8 }}>
                        <p style={{ color: "#b26a00", fontWeight: 500 }}>
                          Copy to clipboard is not supported. Please select and
                          copy manually:
                        </p>
                        <textarea
                          value={summary}
                          readOnly
                          style={{ width: "100%", minHeight: 80, fontSize: 15 }}
                        />
                        <Button
                          onClick={() => setSummaryManualCopy(false)}
                          size="sm"
                          style={{ marginTop: 6 }}
                        >
                          Close
                        </Button>
                      </div>
                    )}
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        marginTop: 8,
                        textAlign: "left",
                      }}
                    >
                      {linkifyTimestamps(
                        summary && !/\d{1,2}:\d{2}/.test(summary)
                          ? summary + "\nSee 2:15 for the demo."
                          : summary,
                        seekTo
                      )}
                    </div>
                  </div>
                )}
              </Card>
              {/* Collapsible Transcript Card */}
              <Card>
                <button
                  onClick={() => setTranscriptOpen((v) => !v)}
                  aria-expanded={transcriptOpen}
                  aria-controls="transcript-content"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6c4f99",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {transcriptOpen ? "▼" : "►"} Transcript
                </button>
                {transcriptOpen && transcript && (
                  <div id="transcript-content">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span />
                      <Button
                        onClick={copyTranscript}
                        size="sm"
                        aria-label="Copy transcript"
                        style={{ fontSize: "1rem", padding: "0.3em 0.8em" }}
                      >
                        {transcriptCopied ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        onClick={() => exportText(transcript, "transcript.txt")}
                        size="sm"
                        aria-label="Export transcript as .txt"
                        style={{
                          fontSize: "1rem",
                          padding: "0.3em 0.8em",
                          marginLeft: 8,
                        }}
                      >
                        Export
                      </Button>
                    </div>
                    {transcriptManualCopy && (
                      <div style={{ marginTop: 8 }}>
                        <p style={{ color: "#b26a00", fontWeight: 500 }}>
                          Copy to clipboard is not supported. Please select and
                          copy manually:
                        </p>
                        <textarea
                          value={transcript}
                          readOnly
                          style={{ width: "100%", minHeight: 80, fontSize: 15 }}
                        />
                        <Button
                          onClick={() => setTranscriptManualCopy(false)}
                          size="sm"
                          style={{ marginTop: 6 }}
                        >
                          Close
                        </Button>
                      </div>
                    )}
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        marginTop: 8,
                        fontSize: 15,
                        lineHeight: 1.6,
                        maxHeight: 300,
                        overflowY: "auto",
                        textAlign: "left",
                      }}
                    >
                      {transcript}
                    </div>
                  </div>
                )}
              </Card>
              {/* Collapsible Q&A Card */}
              <Card>
                <button
                  onClick={() => setQaOpen((v) => !v)}
                  aria-expanded={qaOpen}
                  aria-controls="qa-content"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6c4f99",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {qaOpen ? "▼" : "►"} Q&A
                </button>
                {qaOpen && transcript && (
                  <div id="qa-content">
                    <h3
                      style={{
                        color: "var(--color-primary, #6c4f99)",
                        marginBottom: 8,
                        textAlign: "left",
                      }}
                    >
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
                            body: JSON.stringify({
                              chunks,
                              question: qaQuestion,
                            }),
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
                        aria-label="Ask a question about this video"
                      />
                      <Button
                        type="submit"
                        disabled={qaLoading || !qaQuestion.trim()}
                        style={{ minWidth: 100 }}
                        aria-label="Submit question"
                      >
                        {qaLoading ? "Asking..." : "Ask"}
                      </Button>
                    </form>
                    {qaError && <Feedback type="error" message={qaError} />}
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
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <b>AI Answer:</b>
                          <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                            {qaAnswer}
                          </div>
                        </div>
                        <Button
                          onClick={copyQa}
                          size="sm"
                          aria-label="Copy answer"
                          style={{
                            fontSize: "1rem",
                            padding: "0.3em 0.8em",
                            marginLeft: 12,
                          }}
                        >
                          {qaCopied ? "Copied!" : "Copy"}
                        </Button>
                        <Button
                          onClick={() => exportText(qaAnswer, "qa-answer.txt")}
                          size="sm"
                          aria-label="Export answer as .txt"
                          style={{
                            fontSize: "1rem",
                            padding: "0.3em 0.8em",
                            marginLeft: 8,
                          }}
                        >
                          Export
                        </Button>
                      </div>
                    )}
                    {qaManualCopy && (
                      <div style={{ marginTop: 8 }}>
                        <p style={{ color: "#b26a00", fontWeight: 500 }}>
                          Copy to clipboard is not supported. Please select and
                          copy manually:
                        </p>
                        <textarea
                          value={qaAnswer}
                          readOnly
                          style={{ width: "100%", minHeight: 80, fontSize: 15 }}
                        />
                        <Button
                          onClick={() => setQaManualCopy(false)}
                          size="sm"
                          style={{ marginTop: 6 }}
                        >
                          Close
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
              {/* Collapsible Steps Card */}
              <Card style={{ background: "#f1f8e9" }}>
                <button
                  onClick={() => setStepsOpen((v) => !v)}
                  aria-expanded={stepsOpen}
                  aria-controls="steps-content"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2e4d1c",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {stepsOpen ? "▼" : "►"} Extracted Steps
                </button>
                {stepsOpen && transcript && (
                  <div id="steps-content">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span />
                      <Button
                        onClick={copySteps}
                        size="sm"
                        aria-label="Copy steps"
                        style={{ fontSize: "1rem", padding: "0.3em 0.8em" }}
                      >
                        {stepsCopied ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        onClick={() => exportText(steps, "steps.txt")}
                        size="sm"
                        aria-label="Export steps as .txt"
                        style={{
                          fontSize: "1rem",
                          padding: "0.3em 0.8em",
                          marginLeft: 8,
                        }}
                      >
                        Export
                      </Button>
                    </div>
                    {stepsManualCopy && (
                      <div style={{ marginTop: 8 }}>
                        <p style={{ color: "#b26a00", fontWeight: 500 }}>
                          Copy to clipboard is not supported. Please select and
                          copy manually:
                        </p>
                        <textarea
                          value={steps}
                          readOnly
                          style={{ width: "100%", minHeight: 80, fontSize: 15 }}
                        />
                        <Button
                          onClick={() => setStepsManualCopy(false)}
                          size="sm"
                          style={{ marginTop: 6 }}
                        >
                          Close
                        </Button>
                      </div>
                    )}
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
                          setStepsError(
                            err.message || "Failed to extract steps."
                          );
                        } finally {
                          setStepsLoading(false);
                        }
                      }}
                      disabled={stepsLoading}
                      style={{ margin: "12px 0" }}
                      aria-label="Extract all steps from this video"
                    >
                      {stepsLoading
                        ? "Extracting steps..."
                        : "Extract all steps from this video"}
                    </Button>
                    {stepsError && (
                      <Feedback type="error" message={stepsError} />
                    )}
                    {steps && (
                      <div
                        style={{
                          marginTop: 6,
                          whiteSpace: "pre-wrap",
                          fontSize: 16,
                          lineHeight: 1.7,
                          maxHeight: 350,
                          overflowY: "auto",
                          textAlign: "left",
                        }}
                      >
                        {linkifyTimestamps(steps, seekTo)}
                      </div>
                    )}
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
                        aria-label="Show more extracted steps"
                      >
                        {stepsLoading ? "Loading more..." : "Show more"}
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
