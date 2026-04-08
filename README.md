# Smart Cafe Platform – Fullstack DevOps Project

## Overview

Smart Cafe Platform is a **fullstack web application integrated with a complete DevOps pipeline**, designed to simulate a real-world production system.

This project demonstrates how to:

* Build a fullstack application (React + Node.js)
* Containerize services using Docker
* Configure reverse proxy with Nginx
* Optimize performance using Redis caching
* Monitor system using Prometheus & Grafana
* Automate deployment using Ansible
* Implement CI/CD pipeline with GitHub Actions

👉 The goal is to showcase **real-world DevOps practices** for junior DevOps / fullstack interviews.

---

## Architecture

```
User → Nginx → Frontend (React)
                 ↓
               Backend (Node.js)
                 ↓
        PostgreSQL + Redis
                 ↓
        Prometheus + Grafana
```

---

## Tech Stack

### Frontend

* React.js

### Backend

* Node.js (Express)

### Database

* PostgreSQL

### DevOps Tools

* Docker & Docker Compose
* Nginx (Reverse Proxy)
* Redis (Caching)
* Prometheus & Grafana (Monitoring)
* Ansible (Automation)
* GitHub Actions (CI/CD)

---

## Run Project

### Start system

```
docker-compose up -d --build
```

### Stop system

```
docker-compose down
```

---

## Access

| Service     | URL                   |
| ----------- | --------------------- |
| Application | http://localhost      |
| API         | http://localhost/api  |
| Prometheus  | http://localhost:9090 |
| Grafana     | http://localhost:3001 |

---

## Features

### Fullstack Features

* User authentication (JWT)
* Product management
* Cart & order system
* Admin dashboard

---

### DevOps Features

* Multi-container Docker system
* Nginx reverse proxy
* Redis caching
* Monitoring system
* CI/CD pipeline
* Infrastructure automation with Ansible

---

## Redis Caching

Redis is used to cache API responses to improve performance.

Example:

```
🐢 DB query
⚡ Redis cache HIT
```

👉 Reduces database load and speeds up response time.

---

## Monitoring

### Prometheus

* Collects metrics from `/metrics` endpoint
* Scrapes data periodically

### Grafana

* Visualizes system performance
* Provides monitoring dashboards

---

## Ansible Automation

### Run playbook

```
ansible-playbook -i ansible/inventory ansible/deploy.yml
```

### Tasks

* Stop running containers
* Rebuild Docker system
* Restart services

---

## 📚 Documentation

This project includes comprehensive documentation for the CI/CD pipeline:

| Document | Purpose |
|----------|---------|
| **[QUICK_START.md](QUICK_START.md)** | Quick reference for common commands |
| **[SETUP_AND_DEPLOYMENT.md](SETUP_AND_DEPLOYMENT.md)** | Complete setup and deployment guide |
| **[CI_CD_GUIDE.md](CI_CD_GUIDE.md)** | Technical reference for the CI/CD pipeline |
| **[PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)** | Verification checklist before deployment |
| **[CI_CD_IMPLEMENTATION_SUMMARY.md](CI_CD_IMPLEMENTATION_SUMMARY.md)** | Summary of CI/CD improvements |

---

## 🚀 CI/CD Pipeline

The project includes a complete CI/CD pipeline using GitHub Actions:

### Pipeline Stages

1. **Test & Lint** - Automated testing and code quality checks
2. **Build & Push** - Docker image creation and GHCR push
3. **Security Scan** - Trivy vulnerability scanning
4. **Deploy to Staging** - Automated deployment to staging
5. **Deploy to Production** - Automated deployment to production
6. **Notifications** - Slack notifications (optional)

### Features

✅ Automated testing (Jest for backend, Vitest for frontend)
✅ Code linting (ESLint for both)
✅ Docker image building and scanning
✅ Multi-environment deployment
✅ Ansible integration
✅ Security vulnerability scanning
✅ Optional Slack notifications

### Quick Pipeline Setup

1. Push code to GitHub
2. Workflow automatically triggers
3. Tests and linting run first
4. On main/staging branch: Docker images build and deploy
5. Notifications sent on completion

See [CI_CD_GUIDE.md](CI_CD_GUIDE.md) for complete pipeline documentation.

---

## ✅ Code Quality

- ✅ Backend: ESLint + Jest testing
- ✅ Frontend: ESLint + Vitest testing
- ✅ All linting errors: RESOLVED (0 errors)
- ✅ Production ready: YES

---

## GitHub Secrets Required

To use the full CI/CD pipeline, configure these GitHub secrets:

| Secret | Purpose | Required |
|--------|---------|----------|
| `SSH_PRIVATE_KEY` | Ansible deployment authentication | Yes |
| `SLACK_WEBHOOK_URL` | Slack notifications | No |

See [SETUP_AND_DEPLOYMENT.md](SETUP_AND_DEPLOYMENT.md) for setup instructions.

---

## Local Development Quick Start

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev

# Visit http://localhost:5173
```

Run tests and linting:
```bash
# Backend
npm run lint
npm test

# Frontend
npm run lint
npm test
```

See [QUICK_START.md](QUICK_START.md) for more commands.

---

## Project Status

🚀 **PRODUCTION READY**

- ✅ Complete CI/CD pipeline
- ✅ Automated testing and linting
- ✅ Security scanning
- ✅ Multi-environment deployment
- ✅ Comprehensive documentation

---

## For Interview Prep

This project demonstrates:

1. **Fullstack Development** - React frontend, Node.js backend
2. **DevOps Practices** - Docker, Ansible, CI/CD
3. **Infrastructure Automation** - GitHub Actions, Ansible
4. **Code Quality** - Linting, testing, security scanning
5. **Monitoring & Logs** - Prometheus, Grafana integration
6. **Documentation** - Complete setup and deployment guides

Perfect for showcasing DevOps and fullstack engineering skills! 🎯

---

## Support

Refer to documentation files for help:
- [QUICK_START.md](QUICK_START.md) - Common commands
- [SETUP_AND_DEPLOYMENT.md](SETUP_AND_DEPLOYMENT.md) - Detailed setup
- [CI_CD_GUIDE.md](CI_CD_GUIDE.md) - Pipeline details
- [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md) - Verification

---

## CI/CD Pipeline

### 🔹 Trigger

* Automatically runs on `git push`

### Workflow

```
Git push
→ GitHub Actions
→ Install Ansible
→ Run Ansible Playbook
→ Deploy Docker system
```

### Location

```
.github/workflows/deploy.yml
```

---

## Project Structure

```
smart-cafe-platform/
│
├── backend/               # Node.js backend
├── frontend/              # React frontend
├── docker/                # Nginx configuration
├── ansible/               # Automation playbooks
├── monitoring/            # Prometheus config
├── ci-cd/                 # CI/CD scripts/docs
├── .github/workflows/     # GitHub Actions
├── docker-compose.yml
└── README.md
```

---

## Security

* Environment variables for sensitive data
* JWT authentication
* Docker network isolation

---

## Current Status

| Feature    | Status |
| ---------- | ------ |
| Fullstack  | ✅      |
| Docker     | ✅      |
| Nginx      | ✅      |
| Redis      | ✅      |
| Monitoring | ✅      |
| Ansible    | ✅      |
| CI/CD      | ✅      |

---

## Future Improvements

* Add HTTPS (SSL)
* Add database backup automation
* Improve CI/CD (multi-stage pipeline)
* Add alerting system
* Refactor Ansible using roles

---

## Author

* Name: *Your Name*
* Role: Junior DevOps / Fullstack Developer

---

## Final Note

This project simulates a **production-like DevOps environment**, combining development and operations into a single workflow.

👉 It demonstrates the ability to design, deploy, and maintain a modern web system using DevOps best practices.
