from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from models import AppUser
from schemas import AppUserCreate, AppUserOut, AppUserRole
from security import hash_password

router = APIRouter(tags=["usuarios"])

EMAIL_DUPLICADO = "Já existe um usuário cadastrado com esse e-mail."


@router.post("/usuarios", response_model=AppUserOut, status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(payload: AppUserCreate, db: Session = Depends(get_db)):
    existente = db.scalar(select(AppUser).where(func.lower(AppUser.email) == payload.email.lower()))
    if existente:
        raise HTTPException(status.HTTP_409_CONFLICT, EMAIL_DUPLICADO)

    usuario = AppUser(
        email=payload.email,
        full_name=payload.full_name,
        cpf=payload.cpf,
        senha_hash=hash_password(payload.senha),
    )
    db.add(usuario)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, EMAIL_DUPLICADO)
    db.refresh(usuario)
    return usuario


@router.get("/me/role", response_model=AppUserRole | None)
def get_my_role(x_user_email: str | None = Header(default=None), db: Session = Depends(get_db)):
    """Equivalente ao getMyRole.ts: busca o papel do usuário atual pelo e-mail.

    Enquanto não há login, o e-mail do usuário atual vem do header X-User-Email.
    Retorna null quando o e-mail não tem linha em app_users.
    """
    if not x_user_email:
        return None
    return db.scalar(
        select(AppUser).where(func.lower(AppUser.email) == x_user_email.strip().lower()).limit(1)
    )
