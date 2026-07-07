# Premium AI Chatbot Workspace

A modern, highly responsive, full-stack AI Chatbot application featuring a sleek React (Vite) frontend with glassmorphism aesthetics and a FastAPI backend powered by SQLite (SQLAlchemy) and OpenAI API (with high-fidelity local simulation fallback).

---

## 📂 Project Structure

```
chatbot/
├── frontend/                 # React (Vite) Frontend
│   ├── public/               # Public assets
│   └── src/
│       ├── api/              # Axios API clients
│       ├── components/       # UI Components (Chat, Sidebar, Navbar)
│       ├── pages/            # Page layouts (Home, Chat, NotFound)
│       └── styles/           # Design System & Custom Vanilla CSS
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── api/              # Route endpoints (Chat, Conversations, Health)
│   │   ├── core/             # Configuration & System Prompts
│   │   ├── database/         # Database models, schemas, and CRUD
│   │   └── services/         # Business logic & AI orchestration
│   ├── storage/              # SQLite database storage path
│   └── requirements.txt      # Python dependencies
├── start.sh                  # Integrated startup orchestrator script
└── README.md                 # Project documentation
```

---

## ✨ Features

- **Double-Mode AI Integration**: Connects dynamically to OpenAI GPT models. If `OPENAI_API_KEY` is not present, it utilizes a smart local text parser that simulates AI responses, enabling immediate, offline evaluation.
- **Persistent Conversations**: Full CRUD support for chat threads stored in a local SQLite database (`chatbot.db`).
- **Premium Dark Aesthetics**: Styled using custom, responsive Vanilla CSS variables, featuring gradients, glassmorphism, dynamic scrolling, hover feedback, and custom keyframe animations.
- **Dynamic Session Naming**: Automatically triggers context summaries to overwrite the default `"New Conversation"` title based on the user's first prompt.
- **Health Checks & Monitoring**: The frontend Navbar periodically polls the backend `/health` endpoint to monitor server status and display connection mode (Live vs. Simulated).

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js** (v16.0+) & **npm**
- **Python** (v3.8+)
- (Optional) **OpenAI API Key**

### 🔧 Installation

#### 1. Setup Backend
1. Open a terminal, go to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment settings in `.env`:
   - Duplicate or edit `backend/.env`.
   - Update `OPENAI_API_KEY` with your OpenAI developer key if you want live API responses. Otherwise, leave it blank to run in simulated mode.

#### 2. Setup Frontend
1. Open another terminal, go to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

### Option A: Unified Orchestrator Script (Mac/Linux/Git Bash)
At the root level `chatbot/`, make the shell script executable and run it:
```bash
chmod +x start.sh
./start.sh
```

### Option B: Manual Startup

#### Run FastAPI Server
Activate your virtual environment inside `backend/` and launch Uvicorn:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
*API docs will be available at: http://127.0.0.1:8000/docs*

#### Run Vite Development Server
Start the frontend server inside `frontend/`:
```bash
cd frontend
npm run dev
```
*Frontend workspace will be available at: http://localhost:5173*
