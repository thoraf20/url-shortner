# Professional URL Shortener API

A robust, high-performance URL shortener backend built with **Node.js, TypeScript, PostgreSQL, and Redis**. This project follows senior-level engineering practices, featuring structured logging, asynchronous analytics, and a secure authentication system.

## Features

- **URL Shortening & Redirection**: Fast hashing algorithm with collision handling.
- **Advanced Analytics**:
  - Asynchronous processing via **BullMQ** workers.
  - Detailed tracking of Browser, OS, and Device (mobile/desktop).
  - Aggregated performance reports (Top Browsers, Device Distribution).
- **Authentication & Security**:
  - Secure Signup/Login with **JWT** and **Bcrypt**.
  - URL Ownership: Users can manage and track their own links.
  - Distributed Rate Limiting to prevent abuse.
- **Developer Experience**:
  - Interactive API Documentation via **Swagger (OpenAPI)**.
  - **Structured Logging** with Pino for production observability.
  - Graceful Shutdown and Health Check endpoints (`/health/readiness`).
  - QR Code generation for every shortened link.

## Tech Stack

- **Core**: [Node.js](https://nodejs.org/) (Express)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Persistence)
- **Cache & Rate Limiting**: [Redis](https://redis.io/)
- **Queue System**: [BullMQ](https://docs.bullmq.io/) (Background Workers)
- **Validation**: [Zod](https://zod.dev/)
- **Documentation**: [Swagger UI](https://swagger.io/)
- **Logging**: [Pino](https://getpino.io/)

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis

### Installation
1. **Clone the repository**:
   ```sh
   git clone <repo-url>
   cd url-shortner
   ```
2. **Install dependencies**:
   ```sh
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file from `.env.example`:
   ```env
   PORT=3000
   DATABASE_URL=postgres://user:pass@localhost:5432/shortener
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_super_secret
   API_BASE_URL=http://localhost:3000
   ```
4. **Database Migration**:
   Run the SQL script located in `src/schema/schema.sql` against your PostgreSQL database.
5. **Run the App**:
   ```sh
   npm run dev
   ```

## API Documentation
Once the server is running, visit:
`http://localhost:3000/api-docs`
This provides an interactive UI to explore and test all available endpoints using the built-in Swagger configuration.

## Analytics Engine
Click tracking is offloaded to a background worker to ensure sub-millisecond redirection latency. The worker parses the `User-Agent` and updates the database asynchronously.

## Security
- **Rate Limiting**: Globally applied to all routes, with stricter limits on the `/shorten` endpoint.
- **Authentication**: JWT Bearer tokens are required for personal URL management (`/v1/urls/me`).

## System Health
- **Liveness**: `GET /health/liveness`
- **Readiness**: `GET /health/readiness` (Checks DB and Redis connectivity)

## License
MIT
