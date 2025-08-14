# UNIBE‑EMR

UNIBE‑EMR is a lightweight electronic medical record (EMR) prototype built with React and Tailwind CSS. It allows students to record patient encounters, store them locally in the browser, generate PDF reports, and export/import data as JSON. The app supports both English and Spanish translations and does not require any back‑end server.

## Features

- **Offline‑first** storage using the browser’s local storage.
- **Bilingual** interface with English and Spanish translations.
- **PDF generation** of encounter notes, including patient vitals and SOAP sections.
- **Import/Export** encounters as JSON for backup or transfer.
- **Responsive design** using Tailwind CSS.
- Built‑in **unit tests** and **linters** for code quality.

## Prerequisites

- **Node.js ≥ 18** (we recommend using [corepack](https://github.com/nodejs/corepack) to manage package managers).
- **pnpm ≥ 8** (see below for installation).

## Getting Started

Clone the repository and install dependencies:

```sh
git clone https://github.com/your-org/unibe-emr.git
cd unibe-emr
# Enable corepack (if not already enabled) and install dependencies via pnpm
corepack enable
pnpm install
```

### Development server

Start the app in development mode with hot reloading:

```sh
pnpm dev
```

The application will be available at `http://localhost:5173/` by default. Any changes to the source will reload the page automatically.

### Testing

Run unit tests with [Vitest](https://vitest.dev/):

```sh
pnpm test
```

### Linting and formatting

Lint the source code with ESLint and fix problems automatically:

```sh
pnpm lint
```

Format the codebase using Prettier:

```sh
pnpm format
```

### Building for production

Generate an optimized production build:

```sh
pnpm build
```

The output will be written to the `dist/` directory. You can preview the build using:

```sh
pnpm preview
```

### Docker

A multi‑stage `Dockerfile` is included to build and serve the app in a minimal container. To build and run the container:

```sh
docker build -t unibe-emr:latest .
docker run -p 8080:80 unibe-emr:latest
```

The application will be served by NGINX at `http://localhost:8080/`.

### Development Container

The project includes a [devcontainer](https://code.visualstudio.com/docs/remote/containers) configuration for VS Code. Open the repository in VS Code and run **“Reopen in Container”** to spin up a fully configured development environment with Node.js, pnpm, ESLint, and Prettier installed.

## Environment Variables

Environment variables for the front‑end are prefixed with `VITE_` to be exposed to the client. Copy `.env.example` to `.env` and adjust as needed:

```ini
# Example environment configuration
VITE_API_BASE_URL=https://api.example.com
```

Note: the current version of UNIBE‑EMR does not rely on any back‑end API and therefore does not require environment variables. The example above illustrates how to add your own configuration should you extend the app.

## Continuous Integration / Continuous Deployment (CI/CD)

This repository uses **GitHub Actions** for automated linting, testing, building, and releasing. The workflow definitions can be found in `.github/workflows/`:

- **ci.yml** runs on every push and pull request to install dependencies, run ESLint, execute unit tests, and build the project.
- **release.yml** runs when a semantic version tag (e.g. `v0.1.0`) is pushed to `main`. It builds the project, creates a GitHub Release, and uploads the production artifacts.
- **pages.yml** (optional) can deploy the static build to GitHub Pages by uploading the `dist/` directory. To enable this, configure the Pages build and provide a deployment token as secret.

## Release Process

1. Ensure `main` is up to date and all tests pass.
2. Bump the version in `package.json` following [SemVer](https://semver.org/) and update `CHANGELOG.md`.
3. Commit the changes using a conventional commit message (e.g. `chore(release): v0.1.1`).
4. Create a git tag matching the version (e.g. `git tag v0.1.1`) and push it to GitHub.
5. The **release.yml** workflow will run automatically, build the project, create a GitHub Release, and attach the build artifacts.

## Contributing

We welcome contributions! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to propose changes, report bugs, or submit pull requests.

## License

This project is licensed under the terms of the [MIT License](LICENSE).
