# Task Manager

A modern, full-stack task management application built with FastAPI (Python) for the backend and React (Vite + Material UI) for the frontend.

## Features

- Project and task management
- Overdue task notifications
- Customizable theme (light/dark, accent color)
- Responsive UI with sidebar widgets
- SQLite database for easy local development

## Project Structure

```
├── app.py            # FastAPI backend
├── frontend/         # React frontend (Vite, MUI)
├── tasks.db          # SQLite database (auto-created)
├── venv/             # Python virtual environment (not tracked)
└── .gitignore        # Ignores venv, __pycache__, db, node_modules, etc.
```

## Getting Started

### Backend (FastAPI)

1. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. **Install dependencies:**
   ```bash
   pip install fastapi uvicorn sqlalchemy pydantic
   ```
3. **Run the backend server:**
   ```bash
   uvicorn app:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`.

### Frontend (React + Vite)

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Usage

- Open the frontend in your browser.
- Create a project, add tasks, and explore the features.
- The backend and frontend communicate via REST API.

## Notes

- Do **not** commit your `venv/`, `__pycache__/`, or `tasks.db` to version control (already handled by `.gitignore`).
- For production, consider using a more robust database and environment variable management.

## License

MIT
