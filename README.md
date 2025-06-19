# Habit Quest API

A TypeScript-based Express.js application deployed via the Serverless Framework and powered by PostgreSQL.

## 🚀 Features

- Express.js + TypeScript
- PostgreSQL with TypeORM
- Serverless deployment to AWS Lambda
- ESLint & Jest setup
- CI via GitHub Actions

---

## 🛠️ Prerequisites

- Node.js (v20+)
- PostgreSQL (local or cloud like RDS)
- [Serverless Framework](https://www.serverless.com/framework/docs/getting-started/)

---

## 🧑‍💻 Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/habit-quest-api.git
cd habit-quest-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create and configure `.env`

```bash
cp .env.example .env
```

Edit `.env` with your database credentials.

---

## 🐘 Setting up PostgreSQL

### macOS (Homebrew)

```bash
brew install postgresql
brew services start postgresql
createuser -s postgres
createdb habitquest
```

### Windows

1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. During setup:
   - Set username: `postgres`
   - Set password: `password`
3. Use pgAdmin or `psql` to create a database:

```sql
CREATE DATABASE habitquest;
```

You can also use pgadmin to create the local db, if you prefer

### pgAdmin Setup (Optional GUI)

pgAdmin is a powerful graphical interface for managing PostgreSQL databases.

#### Install pgAdmin

- macOS and Windows: [Download from the official site](https://www.pgadmin.org/download/)

#### Connect to your local database

1. Open pgAdmin and right-click on **Servers > Create > Server...**
2. Under **General**, name your server (e.g., `Local DB`)
3. Under **Connection**:
   - Host name/address: `localhost`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: your local user (e.g., `postgres`)
   - Password: the one you set via `ALTER USER`
4. Save and connect

#### Connect to AWS RDS
Not needed for local development

1. Make sure your RDS instance is **publicly accessible** and your IP is added to the **RDS security group** (inbound rule on port `5432`)
2. Create a new server in pgAdmin:
   - Host: your RDS endpoint (e.g., `mydb.xxxxxxx.us-east-1.rds.amazonaws.com`)
   - Port: `5432`
   - Username: your RDS user (e.g., `admin`)
   - Password: your RDS password

---

## 🧪 Migrations
This is what sets up the DB

Generate:
```bash
npm run typeorm migration:generate src/migrations/NameOfMigration -- -p
```

Run:
```bash
npm run typeorm migration:run
```

---

## 🏃 Run Locally

```bash
npm run local
```

- Runs Express locally at `http://localhost:3000`
- You can test the base route with: `curl http://localhost:3000/`

TODO setup postman 

---

## 🧪 Run Tests

```bash
npm test
```

---

## 🧹 Linting

```bash
npm run lint
npm run lint:fix
```

---

## ☁️ Deploy to AWS
Not needed for local development, you need need correct environment variables in order to directly deploy, otherwise it will be handle by github actions.

```bash
npm run deploy
```

Make sure your AWS credentials and Serverless config are set up properly.

---

## 🤝 Contributing

Open Issue for required work, and link pull request
