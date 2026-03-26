#!/bin/bash
# GitHub Webhook Deployment Script
# This script is triggered by GitHub webhook when master branch is updated

set -e

# Log file
LOG_FILE="/root/mekness/logs/webhook-deploy.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🚀 Webhook deployment triggered"

# Change to project directory
cd /root/mekness || exit 1

# Run the deployment script
log "📥 Executing deploy-live.sh..."
bash /root/mekness/deploy-live.sh >> "$LOG_FILE" 2>&1

DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    log "✅ Deployment completed successfully"
    exit 0
else
    log "❌ Deployment failed with exit code: $DEPLOY_EXIT_CODE"
    exit 1
fi




