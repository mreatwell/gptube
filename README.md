# gptube - YouTube Tutorial Companion

## Overview

The YouTube Tutorial Companion is a web application designed to transform YouTube video tutorials into structured, actionable guides. It allows users to input a YouTube video URL and receive a transcript, AI-generated summary, step-by-step instructions, and clarifications.

## Core Features

*   **YouTube URL Processing & Transcription:** Fetches video transcripts via YouTube Captions API or Whisper API.
*   **GPT-4o Content Analysis:** Generates summaries, step-by-step instructions, and corrections.
*   **Interactive Content Display:** Presents processed information in a user-friendly, responsive interface.
*   **Contextual Chatbot:** AI-powered Q&A based on video content.

## Setup Instructions

Detailed setup instructions will be provided here once the core components are developed. This will include:

*   Cloning the repository.
*   Installing dependencies (Node.js, npm/yarn).
*   Setting up environment variables (API keys for OpenAI, Google Cloud).
*   Running the development server.

## Usage Examples

1.  **Input URL:** Paste a YouTube tutorial URL into the input field.
2.  **Process:** Click the process button.
3.  **View Content:** Access the transcript, summary, and step-by-step guide.
4.  **Chat:** Ask questions to the AI chatbot for further clarification.

## Tech Stack

*   **Frontend:** Next.js (React)
*   **Backend:** Node.js, Firebase Functions
*   **AI Model:** GPT-4o
*   **Transcription:** YouTube API, Whisper API
*   **Database:** Firebase Firestore
*   **Hosting:** Vercel/Render, Firebase

## Contributing Guidelines

Contributions are welcome! Please follow these guidelines:

*   **Branching:** Create feature branches from `main` (e.g., `feature/your-feature-name`).
*   **Commits:** Write clear, concise commit messages (e.g., `feat: add transcript display component`).
*   **Pull Requests:** Submit pull requests to `main` for review. Ensure all tests pass and code is linted.
*   **Issue Tracking:** Check existing issues or create a new one before starting significant work.

(Further details on code style and PR process will be added to a `CONTRIBUTING.md` file as per Subtask 1.3)

## License Information

This project will be licensed under the [MIT License](LICENSE.md). (A `LICENSE.md` file will be added).