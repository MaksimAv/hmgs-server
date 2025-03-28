# API for Hotel Management System

## Related repositories

- Contracts for Hotel Management System: [Link](https://github.com/MaksimAv/hmgs-contracts)

## Development external dependencies

- Node.js v22.14.0
- PostgreSQL v16.8
- Redis v7.4.2
- Docker v28.0.2
- Docker Compose v2.34.0

## Running locally

- Prepare `.env` file from [`.env.template`](./.env.template)

```bash
$ npm ci

$ npm run start:dev:app

$ npm run start:dev:worker
```

## Running with docker

- Prepare `.env.demo` file from [`.env.demo.template`](./.env.demo.template)

```bash
# Application will be running on port 5001
$ docker compose up
```

## Running tests

- Prepare `.env.test` file from [`.env.template`](./.env.template)

```bash
$ npm run test:e2e
```

## System routes

- Swagger Docs: `/api`
- Bull Board: `/system/queues`
