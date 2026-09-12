#!/bin/bash
# Build script for Render deployment
# This script ensures vite and all devDependencies are installed
# even when NODE_ENV=production is set

set -e  # Exit on error

echo "==> Farhad Global Trade Build Script"
echo "==> Installing all dependencies (including devDependencies)..."

# Explicitly install all dependencies including devDependencies
# This overrides NODE_ENV=production behavior
npm install --include=dev

echo "==> Building with Vite..."
npm run build

echo "==> Build completed successfully!"
