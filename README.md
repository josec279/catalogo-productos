# Catálogo de Productos — Proyecto Final

MVP de una sola tabla (`products`).

| Capa | Tecnología | Carpeta |
|------|-----------|---------|
| Base de datos | Supabase (PostgreSQL) | `backend/schema.sql` |
| API | FastAPI en Render | `backend/` |
| Frontend | React + Vite + Tailwind en Vercel | `frontend/` |
| Agente IA | Gemini (Google AI Studio) con herramientas de solo lectura sobre la BD | `backend/agent.py` |

## Ejecutar en local

```powershell
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # y completar DATABASE_URL
uvicorn main:app --reload --port 8000   # http://127.0.0.1:8000/docs

# Frontend
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Endpoints

- `GET  /api/v1/products` → 200 OK
- `POST /api/v1/products` → 201 Created
- `POST /api/v1/chat` → agente Gemini que consulta la BD (requiere `GEMINI_API_KEY`)

## Despliegue

**Render (backend):** Root Directory `backend` · Build `pip install -r requirements.txt` ·
Start `uvicorn main:app --host 0.0.0.0 --port $PORT` · Variables `DATABASE_URL`, `GEMINI_API_KEY`.

**Vercel (frontend):** Root Directory `frontend` · Framework Vite · Variable `VITE_API_URL` = URL de Render.
