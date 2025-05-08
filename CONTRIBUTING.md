*   **Commit Message Guidelines:**
    *   Start with a type (e.g., `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`).
    *   Use the imperative mood (e.g., "Add user login" not "Added user login" or "Adds user login").
    *   Keep the subject line short (under 50 characters if possible).
    *   Provide a more detailed description in the commit body if necessary.
    *   Example:
        ```
        feat: add transcript display component

        This commit introduces a new React component to display the
        video transcript. It includes styling and basic error handling.
        ```
    *   **Commit messages are automatically validated using commitlint based on the Conventional Commits specification.**

```bash
git add .
git commit -m "feat: your concise commit message" 