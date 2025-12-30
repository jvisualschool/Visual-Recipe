#!/bin/bash

# ==========================================
# CHEF Deployment Script with Backups
# ==========================================

# 1. Server Configuration (from server_config.json)
SERVER_IP="15.164.161.165"
SSH_USER="bitnami"
SSH_KEY="/Users/jinhojung/.ssh/jvibeschool_org.pem"
REMOTE_WEB_ROOT="/opt/bitnami/apache/htdocs/CHEF"
REMOTE_BACKUP_ROOT="/home/bitnami/backups_chef"
DB_USER="root"
DB_PASS="REDACTED"
DB_NAME="bitnami_app"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_KEEP_COUNT=4

echo "========================================"
echo "🚀 Starting Deployment: $TIMESTAMP"
echo "========================================"

# 2. Build Frontend locally
echo "📦 [Local] Building Frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Deployment aborted."
    exit 1
fi
cd ..
echo "✅ Build successful."

# 3. Remote Backups
echo "🔒 [Remote] Connecting to server for backups..."

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP << EOF
    # A. Setup Backup Dirs
    mkdir -p $REMOTE_BACKUP_ROOT/db
    mkdir -p $REMOTE_BACKUP_ROOT/code
    mkdir -p $REMOTE_BACKUP_ROOT/images

    # B. Database Backup
    echo "   💾 Backing up Database..."
    # Warning: Using password on CLI can be insecure, but standard for simple scripts.
    mysqldump -u $DB_USER -p'$DB_PASS' $DB_NAME > $REMOTE_BACKUP_ROOT/db/db_backup_$TIMESTAMP.sql
    gzip $REMOTE_BACKUP_ROOT/db/db_backup_$TIMESTAMP.sql

    # C. Code Backup (Creating tar of existing CHEF folder, excluding uploads)
    echo "   🗂️ Backing up Current Code..."
    if [ -d "$REMOTE_WEB_ROOT" ]; then
        # Check if directory is not empty
        if [ "\$(ls -A $REMOTE_WEB_ROOT)" ]; then
            tar --exclude='uploads' -czf $REMOTE_BACKUP_ROOT/code/code_backup_$TIMESTAMP.tar.gz -C /opt/bitnami/apache/htdocs CHEF
        else
            echo "      (Target directory is empty, skipping code backup)"
        fi
        
        # Rotation: Keep last $BACKUP_KEEP_COUNT files
        cd $REMOTE_BACKUP_ROOT/code
        ls -tp | grep -v '/$' | tail -n +$((BACKUP_KEEP_COUNT + 1)) | xargs -I {} rm -- {}
    else
        echo "   ⚠️ No existing deployment found."
    fi

    # D. Images Backup (Specific backup for uploads only)
    echo "   🖼️ Backing up Generated Images..."
    if [ -d "$REMOTE_WEB_ROOT/uploads" ]; then
        tar -czf $REMOTE_BACKUP_ROOT/images/images_backup_$TIMESTAMP.tar.gz -C $REMOTE_WEB_ROOT uploads
        
        # Rotation for images too
        cd $REMOTE_BACKUP_ROOT/images
        ls -tp | grep -v '/$' | tail -n +$((BACKUP_KEEP_COUNT + 1)) | xargs -I {} rm -- {}
    fi
EOF

if [ $? -ne 0 ]; then
    echo "❌ Remote backup failed. Aborting deployment."
    exit 1
fi

echo "✅ Backups completed."

# 4. Upload Files
echo "wm [Deploy] Uploading new files..."

# Ensure remote directories exist
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "mkdir -p $REMOTE_WEB_ROOT/api && mkdir -p $REMOTE_WEB_ROOT/uploads"

# Upload Frontend (dist content goes to root of CHEF)
echo "   - Uploading Frontend..."
scp -i "$SSH_KEY" -r frontend/dist/* $SSH_USER@$SERVER_IP:$REMOTE_WEB_ROOT/

# Upload Backend API
echo "   - Uploading Backend API..."
scp -i "$SSH_KEY" -r backend/api/* $SSH_USER@$SERVER_IP:$REMOTE_WEB_ROOT/api/

# Upload DB Schema (Backup but not auto-run)
scp -i "$SSH_KEY" backend/db_schema.sql $SSH_USER@$SERVER_IP:$REMOTE_WEB_ROOT/

# 5. Finalize
echo "✨ [Finalize] Setting permissions..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "chmod -R 777 $REMOTE_WEB_ROOT/uploads"

echo "========================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "   URL: https://jvibeschool.org/CHEF/"
echo "========================================"
