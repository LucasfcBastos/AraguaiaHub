FRONTEND

cd frontend
npm install
npm run dev

BACKEND

cd backend
NO WINDOWS
    python .venv\Scripts\activate
NO MACOS/LINUX:
    python source .venv/bin/activate
pip install fastapi uvicorn
uvicorn main:app --reload
