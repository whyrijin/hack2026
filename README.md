 <div align="center">

# HACK 2026

### Four builders. One team. Ideas worth bringing to life.

A team of developers exploring web, mobile, and AI — building, learning, and solving problems together.

[![CI](https://github.com/whyrijin/hack2026/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/whyrijin/hack2026/actions/workflows/ci.yml)
[![Security](https://github.com/whyrijin/hack2026/actions/workflows/security.yml/badge.svg?branch=main)](https://github.com/whyrijin/hack2026/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**[Meet the team](#meet-the-team)** • **[Technology Stack](#technology-stack)** • **[Installation](#installation-and-setup)** • **[Repository](#repository)**

</div>

---

## Meet the team

Get to know the people behind the code. Explore our portfolios for projects, experience, and more.

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Rijin Reji</h3>
      <p><strong>Team Lead</strong> · Full-Stack Developer</p>
      <p>Building responsive interfaces and full-stack products with an eye for clean code and user experience.</p>
      <p><a href="https://portfolio-f6c00.web.app/">Explore portfolio ↗</a></p>
    </td>
    <td width="50%" valign="top">
      <h3>Aby John</h3>
      <p><strong>Team Member</strong> · Mobile Application Developer</p>
      <p>Creating cross-platform mobile experiences with Flutter, Dart, and cloud integrations.</p>
      <p><a href="https://abyjohndev.vercel.app/">Explore portfolio ↗</a></p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Abin Oliver</h3>
      <p><strong>Team Member</strong> · Full-Stack &amp; AI Enthusiast</p>
      <p>Exploring how web, mobile, and AI can come together to create useful digital experiences.</p>
      <p><a href="https://portfolio-b1159-5e6db.web.app/">Explore portfolio ↗</a></p>
    </td>
    <td width="50%" valign="top">
      <h3>Adithyan S Prathap</h3>
      <p><strong>Team Member</strong> · Developer &amp; AI Enthusiast</p>
      <p>Building practical software across web, mobile, and AI, with a focus on real-world problems.</p>
      <p><a href="https://adithyansportfolio.netlify.app/">Explore portfolio ↗</a></p>
    </td>
  </tr>
</table>

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | UI development |
| TypeScript | Type safety |
| Vite | Development server and build tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| React Router DOM | Routing |
| Axios | API communication |
| Lucide React | Icons |
| Recharts | Dashboard charts |

### Backend

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| Django | Backend framework |
| Django REST Framework | REST API development |
| PostgreSQL | Relational database |
| Simple JWT | Authentication |
| Celery | Background task processing |
| Redis | Message broker and caching |
| Celery Beat | Scheduled tasks |
| drf-spectacular | API documentation |
| WeasyPrint | PDF invoice generation |
| Gunicorn | Production application server |

### Development & DevOps

| Technology | Purpose |
|---|---|
| Git & GitHub | Version control |
| GitHub Actions | CI/CD |
| Docker | Containerization |
| Postman | API testing |
| Pytest | Backend testing |
| Vitest | Frontend testing |

---

## Project Structure

```text
hack2026/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── config/
│   ├── accounts/
│   ├── customers/
│   ├── products/
│   ├── plans/
│   ├── quotations/
│   ├── subscriptions/
│   ├── billing/
│   ├── discounts/
│   ├── notifications/
│   ├── payments/
│   ├── analytics/
│   ├── manage.py
│   └── requirements.txt
│
├── .github/
│   └── workflows/
│
├── README.md
├── DEVOPS.md
└── LICENSE
```

---

## Frontend Packages

The frontend uses React, TypeScript and Vite.

### Core packages

```bash
npm install
```

### Application dependencies

```bash
npm install react-router-dom axios lucide-react recharts
```

### UI dependencies

```bash
npm install tailwindcss @tailwindcss/vite
```

### Development

```bash
npm run dev
```

---

## Backend Packages

The backend uses Python, Django and Django REST Framework.

### Create and activate virtual environment

```bash
cd backend

python3 -m venv venv

source venv/bin/activate
```

### Install dependencies

```bash
pip install django djangorestframework django-cors-headers
pip install djangorestframework-simplejwt
pip install psycopg[binary] celery redis
pip install drf-spectacular
pip install weasyprint python-dotenv gunicorn
```

### Install all dependencies from requirements.txt

```bash
pip install -r requirements.txt
```

---

## Run with Docker Compose

Docker Desktop (or Docker Engine with the Compose plugin) is required. From the repository root:

1. Create the environment file and generate **two different** random secrets:

   ```bash
   cp .env.example .env
   python3 -c 'import secrets; print(secrets.token_urlsafe(48))'
   ```

   Run the generator twice and set `DJANGO_SECRET_KEY` and `POSTGRES_PASSWORD` in `.env` to the respective values. Keep `.env` private and do not commit it. Set `DJANGO_ALLOWED_HOSTS` and `DJANGO_CSRF_TRUSTED_ORIGINS` for your host when not using localhost.

2. Start the complete stack:

   ```bash
   docker compose up --build
   ```

   Open [http://localhost:8080](http://localhost:8080); Django admin is at [http://localhost:8080/admin/](http://localhost:8080/admin/). Compose waits for PostgreSQL, runs committed migrations once, then starts Django, the Celery worker, Celery Beat, Redis, and the built frontend. The backend and databases are only reachable inside the Compose network. The frontend remains the Vite starter, and billing REST APIs are still pending. The backend now includes foundational invoice, discount reservation, and email outbox models with Celery cleanup and delivery tasks.

3. In another terminal, inspect the stack or create a Django admin user:

   ```bash
   docker compose ps
   docker compose logs -f backend worker beat
   docker compose exec backend python manage.py createsuperuser
   docker compose exec backend python manage.py check
   ```

   Stop with `docker compose down`. PostgreSQL and Beat data remain in named volumes. **`docker compose down -v` deletes those volumes and their data.** Changing PostgreSQL credentials in `.env` after the database has been initialized does not change the existing database user; manage that change in PostgreSQL as well.

The Compose configuration is designed for a single host and binds the frontend to `127.0.0.1:8080`. For a public deployment, place a trusted HTTPS reverse proxy in front of it, configure real hostnames and trusted CSRF origins, and set `DJANGO_SECURE_SSL_REDIRECT=true`. The outer proxy **must overwrite** `X-Forwarded-Proto` with the real request scheme, not forward an untrusted client-supplied value. Django then enables secure session and CSRF cookies. Provision backups, access controls, and monitoring for your environment; this configuration does not set up TLS or backups. Run only one Beat instance to avoid duplicate scheduled jobs. Redis is an internal broker without durable task guarantees; configure persistence and an appropriate broker policy before relying on it for critical jobs.

Container settings live in `backend/config/container_settings.py`; the existing local Django settings are unchanged. For schema changes, create and commit migrations during development; Compose only runs `migrate`, never `makemigrations`. For upgrades, back up the database and review migrations before starting the new release.

---

## Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js and npm
- Python 3.11+
- PostgreSQL
- Redis
- Git

### 1. Clone the repository

```bash
git clone https://github.com/whyrijin/hack2026.git

cd hack2026
```

### 2. Setup Frontend

```bash
cd frontend

npm install
```

### 3. Setup Backend

Open another terminal:

```bash
cd hack2026/backend

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt
```

### 4. Environment Configuration

The Docker setup above uses a root `.env`. The current local Django settings use SQLite and do not read a `.env` automatically. If you extend local settings, configure the required environment variables for:

- Django secret key
- Database name
- Database user
- Database password
- Database host and port
- Redis URL
- Email configuration

Never commit your actual `.env` file to GitHub.

### 5. Database migrations

```bash
cd hack2026/backend

source venv/bin/activate

python manage.py makemigrations

python manage.py migrate
```

### 6. Create admin account

```bash
python manage.py createsuperuser
```

---

## Running the Application

You need two terminals to run the frontend and backend.

### Terminal 1 – Frontend

```bash
cd hack2026/frontend

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

### Terminal 2 – Backend

```bash
cd hack2026/backend

source venv/bin/activate

python manage.py runserver
```

Backend URL:

```text
http://127.0.0.1:8000
```

---

## Background Processing

Celery and Redis are used for scheduled and asynchronous operations such as recurring invoice generation and email notifications.

### Terminal 3 – Redis

```bash
redis-server
```

### Terminal 4 – Celery Worker

```bash
cd hack2026/backend

source venv/bin/activate

celery -A config worker --loglevel=info
```

### Terminal 5 – Celery Beat

```bash
cd hack2026/backend

source venv/bin/activate

celery -A config beat --loglevel=info
```

> Note: Celery requires its configuration and task definitions to be implemented in Django before these commands can process project tasks. Redis must also be running.

---

## Repository

This repository is the starting point for our hackathon work. It includes a CI and security baseline; application code and project details will be added as the project takes shape.

For workflow setup, branch protection, and deployment planning, see the [DevOps guide](DEVOPS.md).

---

<div align="center">

**Think big. Build together. Keep learning.**

<sub>Made by the Hack 2026 team</sub>

</div>
