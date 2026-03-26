#!/bin/bash

echo "🔑 AWS EC2 SSH Key Setup"
echo "=========================="
echo ""

# Check if user provided the key file
if [ $# -eq 0 ]; then
    echo "❌ Please provide the downloaded .pem file:"
    echo "   Usage: ./setup-ssh-key.sh your-key-file.pem"
    echo ""
    exit 1
fi

KEY_FILE="$1"

# Check if file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ File '$KEY_FILE' not found!"
    echo "   Make sure you downloaded the .pem file from AWS"
    exit 1
fi

echo "✅ Found key file: $KEY_FILE"

# Set correct permissions
echo "🔒 Setting secure permissions..."
chmod 400 "$KEY_FILE"

# Test the key format
echo "🔍 Testing key format..."
if ssh-keygen -l -f "$KEY_FILE" >/dev/null 2>&1; then
    echo "✅ Key format is valid"
else
    echo "❌ Invalid key format"
    exit 1
fi

echo ""
echo "🚀 Ready to connect to EC2:"
echo "   ssh -i $KEY_FILE ubuntu@3.208.10.10"
echo ""
echo "📁 Your key file is now secured with permissions 400"
echo "⚠️  Keep this file secure - don't share it!"
