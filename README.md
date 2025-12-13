# Metric Tracking System

REST API for tracking metrics (Distance and Temperature) with multi-unit support and timezone handling.

## Tech Stack

### Backend
- **Node.js** with **TypeScript 5.3+**
- **Express.js** - Web framework
- **TypeORM 0.3+** - ORM
- **PostgreSQL 15** - Database
- **class-validator** & **class-transformer** - Validation
- **date-fns-tz** - Timezone handling

### Testing
- **Jest 29** - Test framework
- **Supertest** - HTTP testing
- **ts-jest** - TypeScript support

### Architecture
- **Clean Architecture** - 4 layers (Domain, Application, Infrastructure, Presentation)
- **Dependency Injection** - DIContainer

## Docker Setup

Copy and paste this command to start PostgreSQL:

```bash
docker run -d \
  --name everfit-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=everfit_metrics \
  -p 5432:5432 \
  postgres:15-alpine
```

To start the container (if already created):

```bash
docker start everfit-postgres
```

To stop the container:

```bash
docker stop everfit-postgres
```

## Run Project

### 1. Install dependencies

```bash
npm install
```

### 2. Start Docker PostgreSQL

```bash
docker start everfit-postgres
```

### 3. Run development server

```bash
npm run dev
```

Server will run at: `http://localhost:3000`

### 4. Test API

Health check:
```bash
curl http://localhost:3000/health
```

## Run Tests

### Run all tests with coverage

```bash
npm test
```

### Run unit tests only

```bash
npm run test:unit
```

### Run E2E tests only

```bash
npm run test:e2e
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Test Results

```
Test Suites: 8 passed, 8 total
Tests:       151 passed, 151 total
Coverage:    95.85% statements
Time:        ~7.5s
```

## API Endpoints

### Health Check
```
GET /health
```

### Add Metric
```
POST /api/metrics
Content-Type: application/json

{
  "userId": "user123",
  "type": "distance",
  "value": 100,
  "unit": "meter",
  "date": "2023-12-13 10:30:00",
  "timezone": "UTC"
}
```

### Get Metrics
```
GET /api/metrics?userId=user123&type=distance&unit=meter
```

### Get Chart Data
```
GET /api/metrics/chart?userId=user123&type=distance&unit=meter&startDate=2023-12-01&endDate=2023-12-31&timezone=UTC
```

## Supported Units

### Distance
- meter, centimeter, inch, feet, yard

### Temperature
- kelvin, celsius, fahrenheit

## Postman Collection

Import `postman_collection.json` file into Postman to test all endpoints.

## Project Structure

```
src/
├── domain/              # Business logic
├── application/         # Use cases
├── infrastructure/      # Database, DI
└── presentation/        # HTTP controllers

tests/
├── unit/               # Unit tests (126 tests)
└── e2e/                # E2E tests (25 tests)
```

## Scripts

```bash
npm run dev              # Development server
npm run build            # Build production
npm start                # Start production
npm test                 # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests
```
