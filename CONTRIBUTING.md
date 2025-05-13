# Contributing to gptube

We welcome contributions to gptube! Please follow these guidelines to ensure a smooth development process.

## Branching Strategy

- **Primary Development Branch:** All development work should be done on feature branches created from the `develop` branch.
- **Feature Branches:** Name your feature branches descriptively (e.g., `feature/user-authentication`, `fix/transcript-error`).
- **Pull Requests:** Submit pull requests from your feature branch to the `develop` branch for review and merging. Once features are stable in `develop`, they will be merged into `main` for releases.

## Commit Message Guidelines

This project enforces **Conventional Commits** using `commitlint`. Your commit messages **must** adhere to this specification. This helps automate changelog generation and keeps the commit history clean and understandable.

- **Format:** `<type>(<scope>): <subject>`
  - `<type>`: Must be one of `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`.
  - `<scope>` (optional): A noun describing the section of the codebase affected.
  - `<subject>`: Concise description of the change, in imperative mood (e.g., "add user login" not "added user login").
- **Body** (optional): More detailed explanatory text, if necessary. Lines in the body should be wrapped at 100 characters.
- **Footer** (optional): For issue tracking references (e.g., `Closes #123`) or breaking change notifications (`BREAKING CHANGE:`).

- **Example:**

  ```
  feat(auth): implement password reset via email

  Adds the functionality for users to request a password reset link
  sent to their registered email address. Includes new API endpoints
  and UI components for the reset flow.

  Fixes #42
  ```

## Code Quality & Pre-commit Hooks

- **Linting & Formatting:** We use ESLint and Prettier to maintain code quality and consistency. These are run automatically on staged files via Husky pre-commit hooks.
- **Commit Validation:** `commitlint` also runs as a Git hook to ensure your commit messages meet the Conventional Commits standard before the commit is finalized.

## Pull Request Process

1.  Ensure your feature branch is up-to-date with `develop`.
2.  Make sure all tests pass and your code is linted and formatted correctly.
3.  Submit a pull request to `develop` with a clear description of the changes.
4.  Collaborate with reviewers to address any feedback.
5.  Once approved, your PR will be merged into `develop`.

Thank you for contributing!
