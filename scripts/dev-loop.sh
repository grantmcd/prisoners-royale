#!/bin/bash

# A helper script to close the feedback loop between Code -> CI -> CD

REPO="grantmcd/prisoners-royale"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")

echo "=========================================="
echo " 🕵️  Feedback Loop Check: $BRANCH"
echo "=========================================="

# 1. GitHub Actions (CI)
if command -v gh &> /dev/null; then
    echo -e "\n[CI] GitHub Actions Status:"
    # Get the latest run for this branch
    RUN_JSON=$(gh run list --repo $REPO --branch $BRANCH --limit 1 --json status,conclusion,url 2>/dev/null)
    
    if [ -z "$RUN_JSON" ] || [ "$RUN_JSON" == "[]" ]; then
        echo "  ⚠️  No recent runs found for this branch."
    else
        # Use node for parsing JSON
        STATUS=$(echo "$RUN_JSON" | node -e "const j=JSON.parse(require('fs').readFileSync(0)); console.log(j[0].status)")
        RESULT=$(echo "$RUN_JSON" | node -e "const j=JSON.parse(require('fs').readFileSync(0)); console.log(j[0].conclusion)")
        URL=$(echo "$RUN_JSON" | node -e "const j=JSON.parse(require('fs').readFileSync(0)); console.log(j[0].url)")
        
        if [ "$STATUS" == "in_progress" ] || [ "$STATUS" == "queued" ]; then
             echo "  🔄 Status: $STATUS"
        elif [ "$RESULT" == "success" ]; then
             echo "  ✅ Status: PASSING"
        elif [ "$RESULT" == "failure" ]; then
             echo "  ❌ Status: FAILED"
        else
             echo "  $STATUS: $RESULT"
        fi
        echo "  🔗 $URL"
    fi
else
    echo "  ⚠️  'gh' CLI not available. Skipping CI check."
fi

# 2. ArgoCD (CD) - Only relevant if we expect this branch to be live
echo -e "\n[CD] Deployment Status (ArgoCD):"

# Try to find kubectl
KUBECTL_CMD="kubectl"
if [ -f "/home/node/.openclaw/workspace/kubectl" ]; then
    KUBECTL_CMD="/home/node/.openclaw/workspace/kubectl"
fi

if $KUBECTL_CMD version --client &> /dev/null; then
    # Check if the app is healthy
    APP_STATUS=$($KUBECTL_CMD get application prisoners-royale -n argocd -o jsonpath='{.status.health.status}' 2>/dev/null)
    SYNC_STATUS=$($KUBECTL_CMD get application prisoners-royale -n argocd -o jsonpath='{.status.sync.status}' 2>/dev/null)
    
    if [ -z "$APP_STATUS" ]; then
        echo "  ⚠️  App 'prisoners-royale' not found in ArgoCD."
    else
        echo "  Health: $APP_STATUS"
        echo "  Sync:   $SYNC_STATUS"
    fi
else
    echo "  ⚠️  'kubectl' not available. Skipping CD check."
fi

echo "=========================================="
