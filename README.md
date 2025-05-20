# gptube - YouTube Tutorial Companion

## Overview

The YouTube Tutorial Companion is a web application designed to transform YouTube video tutorials into structured, actionable guides. It allows users to input a YouTube video URL and receive a transcript, AI-generated summary, step-by-step instructions, and clarifications.

## Core Features

- **YouTube URL Processing & Transcription:** Fetches video transcripts via YouTube Captions API or Whisper API.
- **GPT-4o Content Analysis:** Generates summaries, step-by-step instructions, and corrections.
- **Interactive Content Display:** Presents processed information in a user-friendly, responsive interface.
- **Contextual Chatbot:** AI-powered Q&A based on video content.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** v18.x (as specified in `Dockerfile`)
- **npm:** (comes with Node.js)
- **Git:** For version control.
- **Docker:** (Optional, for containerized development/deployment)

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/mreatwell/gptube.git
    cd gptube
    ```

2.  **Install dependencies:**
    This project uses npm for package management.

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example:
    ```bash
    cp .env.example .env
    ```
    Then, fill in the necessary API keys and configuration values in your `.env` file. (Details of required variables will be added as they are integrated).

## Development

### Running the Development Server

To start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:4000`.

### Code Quality & Formatting

This project uses ESLint for linting and Prettier for code formatting. Git hooks are set up with Husky, lint-staged, and commitlint to enforce these standards automatically on commit.

- **Lint code:**
  ```bash
  npm run lint
  ```
- **Format code:**
  ```bash
  npm run format
  ```

### Git Hooks

- **Pre-commit:** Automatically runs ESLint and Prettier on staged files.
- **Commit-msg:** Enforces conventional commit message format using commitlint. See [Conventional Commits](https://www.conventionalcommits.org/) for more details.

### Docker (Optional)

A `Dockerfile` is provided for building and running the application in a containerized environment.

1.  **Build the Docker image:**

    ```bash
    docker build -t gptube-app .
    ```

    (Replace `gptube-app` with your preferred image name if desired.)

2.  **Run the Docker container:**
    ```bash
    docker run -p 4000:4000 gptube-app
    ```
    This will map port 4000 on your host to port 4000 in the container. The application will be accessible at `http://localhost:4000`.

## Usage Examples

1.  **Input URL:** Paste a YouTube tutorial URL into the input field.
2.  **Process:** Click the process button.
3.  **View Content:** Access the transcript, summary, and step-by-step guide.
4.  **Chat:** Ask questions to the AI chatbot for further clarification.

## Tech Stack

- **Frontend:** Next.js (React)
- **Backend:** Node.js, Firebase Functions
- **AI Model:** GPT-4o
- **Transcription:** YouTube API, Whisper API
- **Database:** Firebase Firestore
- **Hosting:** Vercel/Render, Firebase

## Contributing Guidelines

Contributions are welcome! Please follow these guidelines:

- **Branching:** Create feature branches from `main` (e.g., `feature/your-feature-name`).
- **Commits:** Write clear, concise commit messages (e.g., `feat: add transcript display component`).
- **Pull Requests:** Submit pull requests to `main` for review. Ensure all tests pass and code is linted.
- **Issue Tracking:** Check existing issues or create a new one before starting significant work.

(Further details on code style and PR process will be added to a `CONTRIBUTING.md` file as per Subtask 1.3)

## License Information

This project will be licensed under the [MIT License](LICENSE.md). (A `LICENSE.md` file will be added).
Push it

# trigger vercel
