# Firestore Schema - gptube

This document outlines the Firestore database schema for the YouTube Tutorial Companion application (MVP).

## Collections

### `processed_videos`

Stores information about each YouTube video that has been processed by the application.

*   **Document ID:** YouTube Video ID (e.g., `dQw4w9WgXcQ`)

*   **Fields:**

    | Field Name         | Type                          | Description                                                                 |
    | ------------------ | ----------------------------- | --------------------------------------------------------------------------- |
    | `youtubeUrl`       | `string`                      | The original YouTube URL submitted by the user.                             |
    | `transcriptOriginal`| `string`                      | The full transcript obtained from YouTube API or Whisper API.              |
    | `summaryAI`        | `string`                      | The AI-generated summary of the video content.                              |
    | `stepsAI`          | `array` of `string` or `object` | An ordered list of AI-generated step-by-step instructions. (Structure TBD) |
    | `clarificationsAI` | `array` of `string` or `object` | An ordered list of AI-generated clarifications or corrections. (Structure TBD) |
    | `processedAt`      | `timestamp`                   | Firestore server timestamp indicating when processing was completed/attempted. |
    | `status`           | `string`                      | The status of the processing job (e.g., "queued", "processing", "completed", "failed"). |
    | `errorMessage`     | `string`                      | Optional field containing an error message if the status is "failed".       |

## Future Considerations

*   **`users` Collection:** To store user account information (potentially linking via `userId` in `processed_videos`).
*   **Chat History:** Could be stored as a subcollection under `processed_videos` or in a separate top-level collection.
*   **Indexing:** Composite indexes may be required for querying based on fields other than the Document ID (e.g., `userId`, `processedAt` for history features).
*   **Large Transcripts:** For very long videos, consider storing `transcriptOriginal` in Firebase Storage and linking the URL here to optimize document size and cost. 