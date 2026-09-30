from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, TypeDecorator, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UTCDateTime(TypeDecorator):
    """Guarda em UTC e devolve datetimes com fuso (o SQLite descarta o tzinfo)."""

    impl = DateTime
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None and value.tzinfo is not None:
            value = value.astimezone(timezone.utc).replace(tzinfo=None)
        return value

    def process_result_value(self, value, dialect):
        if value is not None and value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value


class Produto(Base):
    __tablename__ = "produtos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String)
    quantidade: Mapped[int] = mapped_column(Integer)
    minimo: Mapped[int] = mapped_column(Integer)
    maximo: Mapped[int] = mapped_column(Integer)
    preco: Mapped[float] = mapped_column(Float)
    atualizacao: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow, onupdate=utcnow)


class Movimentacao(Base):
    __tablename__ = "movimentacoes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tipo_rota: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    origem: Mapped[str] = mapped_column(String)
    destino: Mapped[str] = mapped_column(String)
    criado_por_nome: Mapped[str] = mapped_column(String)
    criado_em: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)

    produtos: Mapped[list["MovimentacaoProduto"]] = relationship(
        back_populates="movimentacao",
        cascade="all, delete-orphan",
        order_by="MovimentacaoProduto.id",
    )
    edicoes: Mapped[list["MovimentacaoEdicao"]] = relationship(
        back_populates="movimentacao",
        cascade="all, delete-orphan",
        order_by="MovimentacaoEdicao.id",
    )


class MovimentacaoProduto(Base):
    __tablename__ = "movimentacao_produtos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    movimentacao_id: Mapped[int] = mapped_column(ForeignKey("movimentacoes.id", ondelete="CASCADE"))
    # Texto livre, como no original: nome do produto e quantidade ("60", "1/2"...).
    produto: Mapped[str] = mapped_column(String)
    quantidade: Mapped[str] = mapped_column(String)

    movimentacao: Mapped[Movimentacao] = relationship(back_populates="produtos")


class MovimentacaoEdicao(Base):
    __tablename__ = "movimentacao_edicoes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    movimentacao_id: Mapped[int] = mapped_column(ForeignKey("movimentacoes.id", ondelete="CASCADE"))
    nome: Mapped[str] = mapped_column(String)
    data: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)

    movimentacao: Mapped[Movimentacao] = relationship(back_populates="edicoes")


class AppUser(Base):
    __tablename__ = "app_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String)
    full_name: Mapped[str] = mapped_column(String)
    cpf: Mapped[str] = mapped_column(String)
    senha_hash: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String, default="member")


# Nome do produto e e-mail do usuário são únicos sem diferenciar maiúsculas.
Index("uq_produtos_nome_lower", func.lower(Produto.nome), unique=True)
Index("uq_app_users_email_lower", func.lower(AppUser.email), unique=True)
