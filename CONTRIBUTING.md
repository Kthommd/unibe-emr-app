# Contributing to UNIBE‑EMR

First off, thank you for taking the time to contribute! Following these guidelines will help maintain a clean and healthy codebase.

## Branching Strategy

We use a simple branching model based off of `main`:

* **`main`** holds the latest production-ready code. Only tagged releases are merged into this branch.
* **feature branches** (`feat/your-feature-name`) are created off of `main` for new features.
* **fix branches** (`fix/your-bug-name`) are created off of `main` for bug fixes.
* **chore branches** (`chore/your-task-name`) are used for documentation, refactoring, or build changes.

When your work is ready, open a Pull Request (PR) against `main`. The PR description should include:

* A short summary of what the change does.
* A link to any related issues.
* Instructions to test the change if not obvious.

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification to make commit history easy to read and automate release notes. Examples:

```text
feat: add PDF export functionality

fix: correct patient age validation

chore: update ESLint configuration
```

The scope (text between `feat` and the colon) is optional but recommended.

## Pull Request Review

All PRs undergo peer review before merging. During review we look for:

* Clear, well‑documented code and tests.
* Consistent formatting (run `pnpm lint` and `pnpm format` before pushing).
* Minimal impact on existing functionality.
* Appropriate test coverage. For bug fixes, please include a regression test.

At least one approving review is required before merge. Maintainers may request changes; please address them promptly.

## Developer Certificate of Origin (DCO) / CLA

By contributing to this project you certify that your contribution is made under the same license (MIT) and that you have the right to do so. A signed-off-by line in your commit message is not required, but contributors must agree to the terms of the project license.

## Getting Started

1. Fork this repository and clone it locally.
2. Install dependencies: `pnpm install` (you may need to run `corepack enable` first).
3. Run the application in development: `pnpm dev`.
4. Run tests: `pnpm test`.
5. When ready, push your branch and open a PR.

If you encounter any issues while setting up the project, please open an issue with as much detail as possible.