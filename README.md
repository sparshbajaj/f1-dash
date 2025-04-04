<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./dash/public/tag-logo.png" width="200">
    <img alt="f1-dash" src="./dash/public/tag-logo.png" width="200">
  </picture>
</p>

<h1 align="center">f1-dash: Real-time Formula 1 Telemetry Dashboard</h1>

**f1-dash** is a web application designed to provide fans with real-time Formula 1 telemetry and timing data during live sessions. Get deeper insights into the race beyond the standard broadcast feed.

## Features

*   **Live Leaderboard:** Track driver positions, intervals, and gaps in real-time.
*   **Tire Information:** See current tire compounds and stint lengths for each driver.
*   **Lap Times:** Monitor individual lap times and sector times.
*   **Mini Sectors:** Analyze performance through detailed mini-sector data.
*   **Session Information:** View current track status (flags), weather conditions, and more.

## Architecture

The project consists of several components working together:

*   **Frontend (`dash/`):** A [Next.js](https://nextjs.org/) application providing the user interface and dashboard visualization.
*   **Live Backend (`crates/live/`):** A Rust service responsible for ingesting live F1 data and broadcasting it via WebSockets to the frontend.
*   **API Backend (`crates/api/`):** A Rust service providing historical data or other necessary API endpoints for the frontend.

These components are designed to be containerized using Docker.

## Running f1-dash

There are multiple ways to run f1-dash:

### 1. Using Docker Compose (Local Development/Testing)

This is the recommended way for local development or testing the full stack.

1.  Ensure you have Docker and Docker Compose installed.
2.  Clone this repository.
3.  (Optional) Create a `compose.env` file based on `compose.env.example` if you need to override default settings.
4.  Run the following command in the project root directory:
    ```bash
    docker compose up -d
    ```
5.  Access the dashboard at `http://localhost:3000`.

This method builds the images locally based on the `dockerfile` and `dash/dockerfile` definitions and uses the `compose.yaml` file for orchestration.

### 2. Using Pre-built Docker Hub Images

The CI/CD pipeline automatically builds and pushes images to Docker Hub (`sparshbajaj14`) upon changes to the `main` or `develop` branches. You can use these images directly.

*   **Frontend:** `docker pull sparshbajaj14/f1-dash:latest`
*   **Live Backend:** `docker pull sparshbajaj14/f1-dash-live:latest`
*   **API Backend:** `docker pull sparshbajaj14/f1-dash-api:latest`

You can run these images using `docker run` commands or adapt the `compose.yaml` file to use these pre-built images instead of building locally (by removing the `build:` sections).

### 3. Deploying on Platforms like CasaOS

You can deploy f1-dash on container orchestration platforms like CasaOS:

1.  Use the Docker Hub images mentioned above (`sparshbajaj14/f1-dash`, `sparshbajaj14/f1-dash-live`, `sparshbajaj14/f1-dash-api`).
2.  Configure the services in CasaOS, ensuring:
    *   The frontend (`f1-dash`) can reach the backends using their service names (`live` and `api`).
    *   Ports are mapped correctly (e.g., `3000:3000` for frontend, `4000:4000` for live, `4001:4001` for api).

## Contributing

Contributions are welcome! If you'd like to help improve f1-dash, please check the GitHub issues, especially those marked as "Good First Issue".

Before contributing, please read the [`CONTRIBUTING.md`](CONTRIBUTING.md) guide for details on the development setup and contribution process.

## Supporting

If you find f1-dash useful and want to support its development, you can [buy me a coffee](https://www.buymeacoffee.com/slowlydev). Your support helps dedicate more time to the project.

## Notice

This project/website is unofficial and is not associated in any way with the Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks of Formula One Licensing B.V.
