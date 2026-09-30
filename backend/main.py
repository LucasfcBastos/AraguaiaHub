import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401  (registra as tabelas no Base.metadata)
from database import Base, engine
from routers import movimentacoes, produtos, usuarios

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Araguaia Hub API")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(produtos.router)
app.include_router(movimentacoes.router)
app.include_router(usuarios.router)


@app.get("/")
def read_root():
    return {"Hello": "World"}
