from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from models import Produto
from schemas import ProdutoCreate, ProdutoOut

router = APIRouter(prefix="/produtos", tags=["produtos"])

NOME_DUPLICADO = "Já existe um produto cadastrado com esse nome. Escolha outro nome."


@router.get("", response_model=list[ProdutoOut])
def listar_produtos(db: Session = Depends(get_db)):
    return db.scalars(select(Produto).order_by(Produto.id.desc())).all()


@router.post("", response_model=ProdutoOut, status_code=status.HTTP_201_CREATED)
def criar_produto(payload: ProdutoCreate, db: Session = Depends(get_db)):
    existente = db.scalar(select(Produto).where(func.lower(Produto.nome) == payload.nome.lower()))
    if existente:
        raise HTTPException(status.HTTP_409_CONFLICT, NOME_DUPLICADO)

    produto = Produto(**payload.model_dump())
    db.add(produto)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, NOME_DUPLICADO)
    db.refresh(produto)
    return produto
