// import '../styles/globals.css'; // Optional: If you create a global CSS file
import React from 'react';

function MyApp({ Component, pageProps }) {
  // Add layout components, context providers, etc. here if needed
  console.log('Rendering _app'); // Simple log for testing
  return <Component {...pageProps} />;
}

export default MyApp; 