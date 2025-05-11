import "../styles/globals.css";
import React from "react";
import Button from "../components/ui/Button/Button";

function MyApp({ Component, pageProps }) {
  // Add layout components, context providers, etc. here if needed
  console.log("Rendering _app"); // Simple log for testing
  return <Component {...pageProps} />;
}

export default MyApp;
