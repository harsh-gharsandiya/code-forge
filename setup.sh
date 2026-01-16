#!/bin/bash

# Collaborative Document Editing Application - Setup Script

echo "========================================"
echo "Setting up Collaborative Docs Application"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "Node.js version: $(node --version)"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "Warning: MongoDB is not found in PATH. Please ensure MongoDB is installed."
fi

# Setup Backend
echo ""
echo "Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo "Please edit backend/.env with your configuration"
fi

echo "Installing backend dependencies..."
npm install

cd ..

# Setup Frontend
echo ""
echo "Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
fi

echo "Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "========================================"
echo "Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Edit backend/.env with your configuration"
echo "3. Start the backend: cd backend && npm start"
echo "4. Start the frontend: cd frontend && npm run dev"
echo "5. Open http://localhost:5173 in your browser"
echo ""
