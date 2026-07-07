#!/bin/bash

# Clean up background servers when script is stopped (Ctrl+C)
trap 'echo "🛑 Stopping servers..."; kill $(jobs -p); exit' SIGINT SIGTERM

echo "============================================="
echo "   💬 Starting AI Chatbot Fullstack Suite 💬  "
echo "============================================="

# Navigate to backend and spin up
echo "👉 Step 1: Starting Backend (FastAPI on Port 8000)..."
cd backend

# Auto-activate venv if it exists
if [ -d "venv" ]; then
    if [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
    elif [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    fi
fi

# Run backend in the background
python -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

cd ..

# Navigate to frontend and spin up
echo "👉 Step 2: Starting Frontend (Vite on Port 5173)..."
cd frontend

# Run frontend in the background
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✨ Applications launched successfully!"
echo "🔗 Frontend: http://localhost:5173"
echo "🔗 Backend Docs: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to terminate both servers."
echo "============================================="

# Keep orchestrator alive and wait for children
wait
