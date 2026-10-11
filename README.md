# DevPulse – Engineering Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Website-00C853?style=for-the-badge&logo=googlechrome&logoColor=white)](https://akkibawane.github.io/DevPules/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/akkibawane/DevPules)
[![Deploy DevPulse to GitHub Pages](https://github.com/akkibawane/DevPules/actions/workflows/deploy.yml/badge.svg)](https://github.com/akkibawane/DevPules/actions/workflows/deploy.yml)

> 🚀 **Live Deployment URL**: **[https://akkibawane.github.io/DevPules/](https://akkibawane.github.io/DevPules/)**  
> 📁 **GitHub Source Code**: **[https://github.com/akkibawane/DevPules](https://github.com/akkibawane/DevPules)**

Real-time developer productivity and engineering telemetry dashboard built with **React 19**, **Spring Boot 3 (Java 21)**, **STOMP WebSockets**, and **Redis Pub/Sub**.

---

# DevPulse – Engineering Intelligence Platform

[![Deploy DevPulse to GitHub Pages](https://github.com/akkibawane/DevPules/actions/workflows/deploy.yml/badge.svg)](https://github.com/akkibawane/DevPules/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-brightgreen?style=flat&logo=github)](https://akkibawane.github.io/DevPules/)
[![React 19](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green?logo=springboot)](https://spring.io/projects/spring-boot)
[![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> Real-time developer productivity and engineering telemetry dashboard built with **React 19**, **Spring Boot 3 (Java 21)**, **STOMP WebSockets**, and **Redis Pub/Sub**.

---

## ?? Live Demo

?? **Live Website**: [https://akkibawane.github.io/DevPules/](https://akkibawane.github.io/DevPules/)  
?? **GitHub Repository**: [https://github.com/akkibawane/DevPules](https://github.com/akkibawane/DevPules)

---
## âš¡ Overview

DevPulse bridges the gap between software development operations and engineering intelligence. It aggregates signals across the entire SDLC:
- **CI/CD Pipelines**: GitHub Actions & Jenkins real-time build streaming, stage progress, duration, and failure alerts.
- **Microservice Deployments**: Multi-environment canary/prod deployment tracking with instant rollback.
- **API Health Matrix**: Live endpoint latency sparklines (Recharts) and uptime metrics across 5 microservices (`api-gateway`, `auth-service`, `payment-service`, `order-processing`, `notification-service`).
- **Production Incidents**: Incident triage board with severity badges (SEV-1/2/3) and MTTR (Mean Time to Resolution).
- **Developer Stream**: Real-time ticker of Git commits, PR merges, and reviews.
- **Event Processing Engine**: Redis Pub/Sub event pipeline delivering sub-50ms updates to React dashboards over WebSockets.

---

## ðŸ›ï¸ System Architecture

```
 GitHub / Jenkins Webhooks
            â”‚
            â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              Spring Boot 3 Event Engine               â”‚
â”‚                                                        â”‚
â”‚  [REST Controllers]  [Webhook Ingest]  [Simulator]     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
            â”‚                                 â”‚
            â–¼                                 â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚     Redis Stream      â”‚         â”‚       H2 / MySQL      â”‚
â”‚   Pub/Sub + Caching   â”‚         â”‚    JPA Persistence    â”‚
â”‚  (devpulse.events)    â”‚         â”‚ (Deployments, Builds) â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
            â”‚
            â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚            Spring STOMP WebSocket Broker               â”‚
â”‚  (/topic/metrics, /topic/builds, /topic/deployments)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚ (Real-Time Push)
                            â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚             React 19 Client Dashboard                  â”‚
â”‚       (Vite + Tailwind CSS + Recharts + Lucide)        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸš€ Quick Start

### 1. Prerequisites
- **Java 21+** (`java -version`)
- **Maven 3.8+** (`mvn -v`)
- **Node.js 20+** & **npm** (`node -v`)
- *(Optional)* **Redis** on `localhost:6379` *(DevPulse automatically falls back to an embedded stream if Redis is not running)*

---

### 2. Run Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.
- REST API: `http://localhost:8080/api/v1/metrics/summary`
- WebSocket endpoint: `http://localhost:8080/ws-devpulse`
- H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:devpulsedb`)

---

### 3. Run Frontend (React 19 + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### 4. Docker Compose (Full Stack Spin-up)
Run the entire platform including Redis and MySQL with one command:
```bash
docker-compose up --build
```

---

## ðŸ“¡ WebSocket Topics

| Destination | Payload | Description |
|---|---|---|
| `/topic/metrics` | `MetricsSummary` | Overall build success rate, deploys today, active incidents, MTTR |
| `/topic/builds` | `BuildJob` | Real-time CI/CD build starts, stage updates, successes, and failures |
| `/topic/deployments` | `Deployment` | New microservice rollouts, canary deployments, and rollbacks |
| `/topic/health` | `ApiHealthList` | Microservice latency fluctuations and status changes |
| `/topic/incidents` | `Incident` | SEV-1, SEV-2 production incidents and resolutions |
| `/topic/activity` | `DeveloperActivity` | Live Git commits, PR merges, and reviews |

---

## ðŸ§ª Interactive Simulation Bar
DevPulse includes a built-in event simulator. In the UI, click:
- **Simulate Deploy**: Roll out a new microservice version to canary or production.
- **Run Pipeline**: Trigger a GitHub Actions or Jenkins build.
- **Trigger SEV-1**: Simulate a critical production incident alert.
- **Live Feed Toggle**: Enable or pause autonomous engineering telemetry generation.

---

## ðŸ“‚ Project Structure
```
devpulse/
â”œâ”€â”€ backend/                  # Spring Boot 3 + Java 21 Application
â”‚   â”œâ”€â”€ src/main/java/com/devpulse/
â”‚   â”‚   â”œâ”€â”€ config/           # WebSocket, Redis, CORS configs
â”‚   â”‚   â”œâ”€â”€ controller/       # Dashboard, Webhook, Simulation endpoints
â”‚   â”‚   â”œâ”€â”€ model/            # JPA entities & DTOs
â”‚   â”‚   â”œâ”€â”€ repository/       # Spring Data JPA repositories
â”‚   â”‚   â”œâ”€â”€ service/          # Event processing, Redis pub/sub, Simulator
â”‚   â”‚   â””â”€â”€ websocket/        # STOMP message broadcaster
â”‚   â”œâ”€â”€ pom.xml
â”‚   â””â”€â”€ Dockerfile
â”œâ”€â”€ frontend/                 # React 19 + Vite Application
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/       # MetricCards, PipelineStream, ApiHealthGrid, etc.
â”‚   â”‚   â”œâ”€â”€ hooks/            # useWebSocket STOMP hook
â”‚   â”‚   â”œâ”€â”€ services/         # REST API client
â”‚   â”‚   â”œâ”€â”€ App.jsx
â”‚   â”‚   â””â”€â”€ index.css
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ vite.config.js
â”‚   â””â”€â”€ Dockerfile
â”œâ”€â”€ .github/workflows/        # GitHub Actions CI workflow
â”œâ”€â”€ Jenkinsfile               # Jenkins declarative pipeline
â””â”€â”€ docker-compose.yml        # Multi-container orchestration
```

