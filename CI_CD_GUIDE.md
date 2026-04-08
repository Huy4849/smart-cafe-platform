# CI/CD Pipeline Architecture

## Overview

This document describes the CI/CD pipeline for the Smart Cafe Platform project.

## Pipeline Structure

### Jobs

#### 1. `test-and-lint` (Required)
- **Trigger**: Push to main/staging or any Pull Request
- **Steps**:
  - Checkout code
  - Setup Node.js 18
  - Install backend dependencies
  - Run backend linting (ESLint)
  - Run backend tests (Jest)
  - Install frontend dependencies
  - Run frontend linting (ESLint)
  - Run frontend tests (Vitest)
- **Status**: Must pass for build to proceed

#### 2. `build-and-push` (Conditional)
- **Dependency**: Requires `test-and-lint` to pass
- **Trigger**: Always runs after lint/test
- **Steps**:
  - Checkout repository
  - Login to GHCR (GitHub Container Registry)
  - Build and push backend Docker image
  - Build and push frontend Docker image
  - Scan images for vulnerabilities using Trivy
  - Upload security results to GitHub

#### 3. `deploy-staging` (Conditional)
- **Dependency**: Requires `build-and-push` to pass
- **Condition**: Only runs on `staging` branch
- **Steps**:
  - Checkout code
  - Setup SSH credentials
  - Run Ansible playbook for staging environment
  - Updates deployed services with latest images

#### 4. `deploy-prod` (Conditional)
- **Dependency**: Requires `build-and-push` to pass
- **Condition**: Only runs on `main` branch
- **Steps**:
  - Checkout code
  - Setup SSH credentials
  - Run Ansible playbook for production environment
  - Updates deployed services with latest images

#### 5. `notify` (Optional)
- **Dependency**: Requires `build-and-push` to pass
- **Always runs**: Sends notification regardless of deployment status
- **Steps**:
  - Send Slack notification on success
  - Send Slack notification on failure
  - Notifications continue even if webhook is not configured

## Branch Strategy

### Main Branch (`main`)
- Production environment
- Protected branch (requires PR review)
- Triggers full CI/CD → Production deployment
- Every merge to main results in a production release

### Staging Branch (`staging`)
- Staging environment
- Pre-production testing
- Triggers full CI/CD → Staging deployment
- Used for QA and integration testing

### Feature Branches
- Development branches
- Create PRs against `main` or `staging`
- Trigger CI (test/lint) but not deployment
- PRs must pass all CI checks

## Environment Configuration

### Repository Secrets Required

```yaml
SSH_PRIVATE_KEY:
  Description: Private SSH key for Ansible
  Format: PEM format private key
  
SLACK_WEBHOOK_URL:
  Description: Slack incoming webhook (optional)
  Format: https://hooks.slack.com/services/...
```

### Environment-specific Hosts

**Staging**: `ansible/environments/staging/hosts.ini`
**Production**: `ansible/environments/prod/hosts.ini`

Each contains:
- Web server(s) for application
- Database server(s)
- Cache server(s) if needed

## Security Scanning

### Trivy Vulnerability Scanning

The pipeline includes automated security scanning:

1. **Image Scanning**: Each Docker image is scanned for known vulnerabilities
2. **SARIF Reports**: Results are uploaded to GitHub's Security tab
3. **Failure on Critical**: Pipeline can be configured to fail on critical vulnerabilities

Location: Security tab → Code scanning alerts

## Docker Images

### Image Names and Tags

```
ghcr.io/your-org/smart-cafe-platform-backend:latest
ghcr.io/your-org/smart-cafe-platform-frontend:latest
```

### Image Build Contexts

- **Backend**: `./backend/Dockerfile`
- **Frontend**: `./frontend/Dockerfile`

## Test Coverage

### Backend (Jest)
- Location: `backend/tests/`
- Coverage: `coverage/`
- Command: `npm test`

### Frontend (Vitest)
- Location: `frontend/src/**/*.test.jsx`
- Coverage: `coverage/`
- Command: `npm test`

## Linting Standards

### Backend (ESLint)
- Config: `backend/.eslintrc.js`
- Command: `npm run lint`
- Fix: `npm run lint:fix`

### Frontend (ESLint)
- Config: `frontend/.eslintrc.js`
- Command: `npm run lint`
- Fix: `npm run lint:fix`

## Deployment via Ansible

### Playbooks

- **Site Playbook**: `ansible/site.yml` - Main deployment orchestration
- **Deploy Role**: `ansible/roles/deploy/` - Handles application deployment
- **Docker Role**: `ansible/roles/docker/` - Docker service management

### Variables

Environment-specific variables in:
- `ansible/environments/staging/group_vars/`
- `ansible/environments/prod/group_vars/`

## Notifications

### Slack Integration (Optional)

When `SLACK_WEBHOOK_URL` is configured:

```
✅ Success Message:
"✅ CI/CD Pipeline completed successfully"

❌ Failure Message:
"❌ CI/CD Pipeline failed"
```

If webhook is not configured, the pipeline continues without errors.

## Performance Metrics

### Average Pipeline Duration

- **test-and-lint**: 3-5 minutes
- **build-and-push**: 5-10 minutes
- **deploy-staging**: 3-5 minutes
- **deploy-prod**: 3-5 minutes
- **Total**: ~15-25 minutes from push to production

## Debugging Failed Pipelines

### Step 1: Check GitHub Actions Log

1. Go to repository → Actions
2. Click on failed workflow run
3. Expand failed job to see error details

### Step 2: Common Issues

| Issue | Solution |
|-------|----------|
| Tests fail | Run locally: `npm test` |
| Lint errors | Run: `npm run lint:fix` |
| Build fails | Check Dockerfile syntax |
| Deploy fails | Verify SSH key and hosts.ini |
| Slack fails | Not critical - pipeline continues |

### Step 3: Retry Pipeline

Failed workflows can be rerun from GitHub Actions UI:
1. Go to the failed run
2. Click "Re-run failed jobs"
3. Or "Re-run all jobs"

## Best Practices

1. **Keep tests fast**: Aim for <5 min combined test time
2. **Comprehensive linting**: Fix all lint warnings locally before push
3. **Clear commit messages**: Include issue/ticket numbers
4. **Test locally first**: Run `npm test` and `npm lint` before pushing
5. **Use staging first**: Deploy to staging to verify before production
6. **Monitor deployments**: Watch production metrics after each deploy
7. **Rollback plan**: Have strategy for reverting failed deployments

## Future Improvements

- [ ] Add code coverage thresholds
- [ ] Add E2E testing with Cypress/Playwright
- [ ] Add performance benchmarking
- [ ] Add database migration checks
- [ ] Add artifact storage for releases
- [ ] Add automated rollback on deployment failure
- [ ] Add status page updates
- [ ] Add Discord/Teams notifications

## References

- GitHub Actions Docs: https://docs.github.com/en/actions
- Ansible Docs: https://docs.ansible.com/
- Trivy Scanner: https://github.com/aquasecurity/trivy
- GHCR: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
