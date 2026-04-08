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
