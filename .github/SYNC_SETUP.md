# Repository Sync Setup

This repository is configured to automatically sync pushes from the `amandaenvato` account to the `amandavarella` account.

## Automatic Sync (GitHub Actions)

A GitHub Actions workflow (`.github/workflows/sync-to-amandavarella.yml`) automatically pushes all changes to the `amandavarella` repository whenever you push to the `amandaenvato` repository.

### Setup Required

To enable automatic syncing, you need to add a GitHub Personal Access Token (PAT) as a secret:

1. **Create a GitHub Personal Access Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name it: `amandavarella-repo-sync`
   - Select scopes: `repo` (full control of private repositories)
   - Generate the token and copy it

2. **Add the token as a repository secret:**
   - Go to the `amandaenvato/amandas-em-automations` repository on GitHub
   - Navigate to: Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `AMANDAVARELLA_GITHUB_TOKEN`
   - Value: Paste your PAT
   - Click "Add secret"

3. **Verify the workflow:**
   - After adding the secret, push any change to the `amandaenvato` repository
   - Check the Actions tab to see the sync workflow running
   - Verify the changes appear in the `amandavarella` repository

## Manual Dual Push

If you want to manually push to both repositories at once, use the git alias:

```bash
git push-both main
# or
git push-both <branch-name>
```

This will push to both `origin` (amandaenvato) and `amandavarella` remotes.

## How It Works

- **Automatic**: The GitHub Actions workflow triggers on every push to any branch in the `amandaenvato` repository
- **Manual**: The `push-both` alias allows you to push to both remotes simultaneously from your local machine
- **Credentials**: Local commits use `amandavarella@gmail.com` (configured in local git config)
- **Remotes**: 
  - `origin` → `amandaenvato/amandas-em-automations`
  - `amandavarella` → `amandavarella/amandas-em-automations`
