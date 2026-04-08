# 🚀 Quick Start Commands

## Local Development

### Backend
```bash
# Navigate to backend
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Watch mode for tests
npm test:watch

# Start development server
npm run dev
```

### Frontend
```bash
# Navigate to frontend
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker

### Build & Run
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Clean up (including volumes)
docker-compose down -v
```

### Access Services
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Git Workflow

### First Time Setup
```bash
# Initialize repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: Initial Smart Cafe Platform with CI/CD"

# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR-ORG/smart-cafe-platform.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main

# Create staging branch
git checkout -b staging
git push -u origin staging
```

### Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: Description of your feature"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# After review and testing:

# Merge to staging first
git checkout staging
git merge feature/your-feature-name
git push origin staging

# Test on staging environment
# After verification:

# Merge to main for production
git checkout main
git merge staging
git push origin main
```

## GitHub Actions

### Monitor Pipeline
1. Go to GitHub repository
2. Click "Actions" tab
3. Watch your workflow run
4. Check logs for any failures

### Common Scenarios

**PR not passing tests?**
- Check Actions tab for details
- Run locally: `npm run lint && npm test`
- Fix issues and push again

**Deploy not working?**
- Verify SSH_PRIVATE_KEY secret is set
- Check Ansible hosts.ini files
- Verify server connectivity

**Want to retry failed job?**
- Go to Actions → failed run
- Click "Re-run failed jobs" or "Re-run all jobs"

## Deployment

### Staging Deployment
```bash
# Merge to staging branch
git checkout staging
git merge feature/branch
git push origin staging

# Wait for GitHub Actions to deploy
# Access at your staging URL
```

### Production Deployment
```bash
# Test on staging first
# Then merge staging to main
git checkout main
git merge staging
git push origin main

# Wait for GitHub Actions to deploy
# Access at your production URL
```

### Manual Deployment (If Needed)
```bash
# SSH into server
ssh your-server.com

# Pull latest code
cd /path/to/app
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d
```

## Database

### PostgreSQL
```bash
# Connect to database
psql -h localhost -U postgres -d smart_cafe

# Common commands
\dt              # List tables
\d table_name    # Describe table
\q               # Quit
```

### Redis
```bash
# Connect to Redis
redis-cli

# Common commands
PING                          # Test connection
KEYS *                        # List all keys
GET key_name                  # Get value
DEL key_name                  # Delete key
FLUSHALL                      # Clear all data
```

## Troubleshooting

### Tests fail locally but pass on CI
- Check Node version: `node --version` (should be 18+)
- Clear cache: `rm -rf node_modules && npm install`
- Run tests again: `npm test`

### Docker won't start
- Check ports aren't in use: `netstat -ano | findstr :5000`
- Clear build cache: `docker-compose build --no-cache`
- Clean up: `docker system prune`

### Can't connect to database
- Verify database is running: `docker-compose ps`
- Check credentials in `.env`
- Verify host/port are correct

### Pipeline fails with "SSH key not found"
- Verify SSH_PRIVATE_KEY secret is set in GitHub
- Ensure public key is on target server
- Check server connectivity

## Useful Links

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Docs](https://docs.docker.com/)
- [Ansible Docs](https://docs.ansible.com/)
- [ESLint Docs](https://eslint.org/)
- [Jest Docs](https://jestjs.io/)
- [Vitest Docs](https://vitest.dev/)

## Need Help?

1. Check relevant documentation file
2. Search existing issues on GitHub
3. Review CI/CD Guide for pipeline details
4. Check Setup guide for configuration help

Documentation Files:
- `SETUP_AND_DEPLOYMENT.md` - Setup instructions
- `CI_CD_GUIDE.md` - Pipeline details
- `PRE_DEPLOYMENT_CHECKLIST.md` - Verification
- `CI_CD_IMPLEMENTATION_SUMMARY.md` - Overview
