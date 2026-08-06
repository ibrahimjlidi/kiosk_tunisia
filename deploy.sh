#!/bin/bash
set -e

# Build backend and frontend Docker images and start services with docker-compose

echo "Building and deploying FuelStation ERP..."

docker compose -f docker-compose.prod.yml build

docker compose -f docker-compose.prod.yml up -d

echo "Deployment complete."

echo "Frontend: http://localhost"
echo "Backend API: http://localhost:5000/api/v1"
