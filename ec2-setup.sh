#!/bin/bash
# Initial EC2 Setup Script - Run once when first setting up EC2 instance
# Usage: Run this script on a fresh EC2 instance

set -e

echo "🔧 Setting up EC2 instance for Rozka Capitals deployment..."

# Update system
echo "📦 Updating system packages..."
sudo dnf update -y  # Amazon Linux 2023
# OR for Ubuntu:
# sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Verify installation
echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Install Git if not present
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    sudo dnf install -y git
fi

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
echo "📦 Installing Nginx..."
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Create app directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/rozka_captial
sudo chown $USER:$USER /opt/rozka_captial

echo ""
echo "✅ EC2 setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository:"
echo "   cd /opt/rozka_captial"
echo "   git clone <your-repo-url> ."
echo ""
echo "2. Run deployment script:"
echo "   ./deploy-aws.sh"
echo ""
echo "3. Configure Nginx (see AWS_DEPLOYMENT.md)"

