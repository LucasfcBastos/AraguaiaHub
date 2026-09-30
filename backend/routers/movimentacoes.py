from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models import Movimentacao, MovimentacaoEdicao, MovimentacaoProduto
from schemas import MovimentacaoCreate, MovimentacaoOut, MovimentacaoStatusUpdate

router = APIRouter(prefix="/movimentacoes", tags=["movimentacoes"])


def _carregar(db: Session, movimentacao_id: int) -> Movimentacao:
    movimentacao = db.scalar(
        select(Movimentacao)
        .where(Movimentacao.id == movimentacao_id)
        .options(selectinload(Movimentacao.produtos), selectinload(Movimentacao.edicoes))
    )
    if movimentacao is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movimentação não encontrada.")
    return movimentacao


@router.get("", response_model=list[MovimentacaoOut])
def listar_movimentacoes(db: Session = Depends(get_db)):
    return db.scalars(
        select(Movimentacao)
        .options(selectinload(Movimentacao.produtos), selectinload(Movimentacao.edicoes))
        .order_by(Movimentacao.id.desc())
    ).all()


@router.post("", response_model=MovimentacaoOut, status_code=status.HTTP_201_CREATED)
def criar_movimentacao(payload: MovimentacaoCreate, db: Session = Depends(get_db)):
    movimentacao = Movimentacao(
        **payload.model_dump(exclude={"produtos"}),
        produtos=[MovimentacaoProduto(**p.model_dump()) for p in payload.produtos],
    )
    db.add(movimentacao)
    db.commit()
    return _carregar(db, movimentacao.id)


@router.patch("/{movimentacao_id}/status", response_model=MovimentacaoOut)
def atualizar_status(
    movimentacao_id: int, payload: MovimentacaoStatusUpdate, db: Session = Depends(get_db)
):
    movimentacao = _carregar(db, movimentacao_id)
    movimentacao.status = payload.status
    movimentacao.edicoes.append(MovimentacaoEdicao(nome=payload.editado_por_nome))
    db.commit()
    return _carregar(db, movimentacao_id)
