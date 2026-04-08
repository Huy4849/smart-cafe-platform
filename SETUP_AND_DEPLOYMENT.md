# Smart Cafe Platform - Setup & Deployment Guide

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 12+
- Redis 6+
- Docker & Docker Compose (for containerized deployment)
- Ansible (for deployment automation)

## 🚀 Quick Start - Local Development

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smart-cafe-platform
```

### 2. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env

# Install dependencies
npm install

# Run migrations (if applicable)
npm run migrate

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Copy environment template
cp .env.example .env

# Edit .env with your API URL
nano .env

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🧪 Testing & Code Quality

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Run Linting

```bash
# Backend linting
cd backend
npm run lint

# Fix linting issues
npm run lint:fix

# Frontend linting
cd frontend
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🐳 Docker Deployment

### Build Images

```bash
docker-compose build
```

### Run Containers

```bash
docker-compose up -d
```

### Access Services

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 🔧 CI/CD Pipeline Configuration

The project uses GitHub Actions for CI/CD. The workflow includes:

1. **Test & Lint**: Runs automated tests and linting checks
2. **Build & Push**: Builds Docker images and pushes to GHCR
3. **Security Scan**: Scans images for vulnerabilities using Trivy
4. **Deploy to Staging**: Deploys to staging environment via Ansible (on staging branch)
5. **Deploy to Production**: Deploys to production environment via Ansible (on main branch)
6. **Notifications**: Sends notifications (optional Slack integration)

### Required GitHub Secrets

To use the full CI/CD pipeline, add these secrets in your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `SSH_PRIVATE_KEY` | SSH key for Ansible deployment |
| `SLACK_WEBHOOK_URL` | (Optional) Slack webhook for notifications |

### Setup Instructions

1. **Generate SSH Key Pair** (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -f deploy-key -N ""
   ```

2. **Add Public Key to Servers**:
   - Add `deploy-key.pub` to `~/.ssh/authorized_keys` on both staging and prod servers

3. **Add Private Key to GitHub Secrets**:
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SSH_PRIVATE_KEY`
   - Value: Content of `deploy-key` (private key)

4. **(Optional) Setup Slack Notifications**:
   - Create a Slack Incoming Webhook
   - Add it as secret: `SLACK_WEBHOOK_URL`

## 📝 Ansible Configuration

Update the following files with your server details:

### `ansible/environments/staging/hosts.ini`

```ini
[web]
staging.yourdomain.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa

[db]
staging-db.yourdomain.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```

### `ansible/environments/prod/hosts.ini`

```ini
[web]
prod.yourdomain.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa

[db]
prod-db.yourdomain.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```

## 🚢 Deployment Flow

```
Push to main/staging branch
         ↓
GitHub Actions triggered
         ↓
┌─────────────────────────────┐
│ 1. Test & Lint              │ (Runs for all branches/PRs)
│    - Backend tests          │
│    - Frontend tests         │
│    - Linting checks         │
└─────────────────────────────┘
         ↓
┌─────────────────────────────┐
│ 2. Build & Push             │ (Only if tests pass)
│    - Build Backend image    │
│    - Build Frontend image   │
│    - Push to GHCR           │
└─────────────────────────────┘
         ↓
         ├─→ (if staging branch)
         │   ┌──────────────────────┐
         │   │ 3. Deploy to Staging │
         │   │ (Ansible Playbook)   │
         │   └──────────────────────┘
         │
         └─→ (if main branch)
             ┌──────────────────────┐
             │ 3. Deploy to Prod    │
             │ (Ansible Playbook)   │
             └──────────────────────┘
         ↓
┌─────────────────────────────┐
│ 4. Send Notifications       │
│    - Slack (if configured)  │
└─────────────────────────────┘
```

## 🔍 Monitoring & Logs

### GitHub Actions Logs

1. Go to your repository
2. Click "Actions"
3. Select the workflow run
4. View logs for each job

### Application Logs

Check logs in the deployment servers:

```bash
# Backend logs
docker logs smart-cafe-backend

# Frontend logs
docker logs smart-cafe-frontend

# App-specific logs
tail -f /var/log/smart-cafe/app.log
```

## 🐛 Troubleshooting

### Tests Fail Locally but Pass on CI

- Ensure you're using Node.js 18+
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check environment variables match .env.example

### Ansible Deployment Fails

- Verify SSH key is authorized on target server
- Check hosts.ini IP/domain is correct and reachable
- Ensure ansible is installed: `pip install ansible`

### Docker Build Issues

- Clear build cache: `docker-compose build --no-cache`
- Check Dockerfile syntax
- Ensure required environment variables are set

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Ansible Documentation](https://docs.ansible.com/)
- [Docker Documentation](https://docs.docker.com/)
- [GHCR Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

## 📞 Support

For issues or questions, please open an issue in the repository.
