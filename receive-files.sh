#!/bin/bash
# Server-side script to prepare for receiving files
# This ensures directories exist and are ready

echo "Preparing server to receive files..."
cd /root/mekness

# Ensure all directories exist
mkdir -p client/src/pages
mkdir -p client/src/components
mkdir -p client/public
mkdir -p client/public/videos
mkdir -p server/services
mkdir -p shared

echo "✓ Server directories ready"
echo ""
echo "Ready to receive files from your local machine."
echo "Run the PowerShell script on your Windows machine now."

