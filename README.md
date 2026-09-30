# Araguaia Hub

Controle de estoque e movimentações (rotas/transferências) de produtos agropecuários.
Frontend em React + Vite + Tailwind (shadcn/ui) e backend em FastAPI + SQLAlchemy (SQLite).

## BACKEND

```bash
cd backend
# NO WINDOWS
.venv\Scripts\activate
# NO MACOS/LINUX
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

A API sobe em http://localhost:8000 (documentação em http://localhost:8000/docs).
O banco SQLite é criado automaticamente em `backend/araguaia.db`.

Variáveis opcionais:
- `DATABASE_URL`: URL do banco (padrão: SQLite em `backend/araguaia.db`)
- `CORS_ORIGINS`: origens liberadas, separadas por vírgula (padrão: `http://localhost:5173,http://127.0.0.1:5173`)

## FRONTEND

```bash
cd frontend
npm install
npm run dev
```

O app sobe em http://localhost:5173 e chama a API em `http://localhost:8000`
(para mudar, defina `VITE_API_URL`).

Outros comandos: `npm run build` e `npm run lint`.
