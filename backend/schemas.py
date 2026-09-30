from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

TipoRota = Literal["Entrada", "Saída"]
StatusRota = Literal["Em separação", "Em trânsito", "Concluída"]

TextoObrigatorio = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# Produtos

class ProdutoCreate(BaseModel):
    nome: TextoObrigatorio
    quantidade: int = Field(ge=0)
    minimo: int = Field(ge=0)
    maximo: int = Field(ge=0)
    preco: float = Field(ge=0)


class ProdutoOut(ORMModel):
    id: int
    nome: str
    quantidade: int
    minimo: int
    maximo: int
    preco: float
    atualizacao: datetime


# Movimentações

class MovimentacaoProdutoIn(BaseModel):
    produto: str
    quantidade: str


class MovimentacaoProdutoOut(ORMModel):
    id: int
    produto: str
    quantidade: str


class MovimentacaoEdicaoOut(ORMModel):
    id: int
    nome: str
    data: datetime


class MovimentacaoCreate(BaseModel):
    tipo_rota: TipoRota
    status: StatusRota
    origem: str
    destino: str
    criado_por_nome: TextoObrigatorio
    produtos: list[MovimentacaoProdutoIn]


class MovimentacaoStatusUpdate(BaseModel):
    status: StatusRota
    editado_por_nome: TextoObrigatorio


class MovimentacaoOut(ORMModel):
    id: int
    tipo_rota: TipoRota
    status: StatusRota
    origem: str
    destino: str
    criado_por_nome: str
    criado_em: datetime
    produtos: list[MovimentacaoProdutoOut]
    edicoes: list[MovimentacaoEdicaoOut]


# Usuários

class AppUserCreate(BaseModel):
    full_name: TextoObrigatorio
    cpf: TextoObrigatorio
    email: TextoObrigatorio
    senha: str = Field(min_length=1)


class AppUserOut(ORMModel):
    id: int
    email: str
    full_name: str
    cpf: str
    role: str


class AppUserRole(ORMModel):
    role: str
    full_name: str
