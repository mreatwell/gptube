import { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

export default function Document() {
  console.log('Rendering _document'); // Simple log for testing
  return (
    <Html lang="en">
      <Head>
        {/* Add custom meta tags, link tags, etc. here */}
        <meta name="description" content="YouTube Tutorial Companion - Convert videos to guides" />
        <link rel="icon" href="/favicon.ico" /> {/* Assumes favicon in public folder */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 