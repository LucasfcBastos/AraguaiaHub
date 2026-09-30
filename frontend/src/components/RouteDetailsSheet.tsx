import { useState } from 'react'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { getDisplayName, getInitial } from '../utils/userDisplay'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type { MovimentacaoProduto, StatusRota } from './CreateMovimentacaoDialog'

export type MovimentacaoEvento = {
  nome: string
  data: string // ISO timestamp
}

export type RouteDetails = {
  id: string
  status: StatusRota
  origin: string
  destination: string
  produtos: MovimentacaoProduto[]
  criadoPor: MovimentacaoEvento
  edicoes: MovimentacaoEvento[]
}

const statusOptions: StatusRota[] = ['Em separação', 'Em trânsito', 'Concluída']

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: RouteDetails | null
  onSave: (routeId: string, status: StatusRota, edicao: MovimentacaoEvento) => void
}

export default function RouteDetailsSheet({ open, onOpenChange, route, onSave }: Props) {
  const { user } = useCurrentUser()
  const [status, setStatus] = useState<StatusRota>('Em separação')

  // Sync the local status selector whenever a (possibly different) route is opened.
  const [synced, setSynced] = useState({ open, route })
  if (synced.open !== open || synced.route !== route) {
    setSynced({ open, route })
    if (open && route) {
      setStatus(route.status)
    }
  }

  if (!route) return null

  const handleSave = () => {
    const nome = getDisplayName(user)
    onSave(route.id, status, { nome, data: new Date().toISOString() })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto !p-0 sm:max-w-md">
        <SheetHeader className="gap-1 bg-emerald-500 p-density-xl text-left dark:bg-emerald-600">
          <SheetTitle className="text-2xl font-extrabold text-white">
            Detalhes da Movimentação
          </SheetTitle>
          <SheetDescription className="truncate text-sm font-semibold text-white/90" title={`Transferência ${route.id}`}>
            Transferência {route.id}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-density-lg overflow-y-auto p-density-xl">
          <div>
            <h3 className="text-sm font-extrabold text-violet-950 dark:text-violet-200">
              Criação
            </h3>
            <div className="mt-density-sm flex items-center gap-density-sm">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white dark:bg-red-500">
                {getInitial(route.criadoPor.nome)}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-bold text-violet-950 dark:text-violet-100"
                  title={route.criadoPor.nome}
                >
                  {route.criadoPor.nome}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dateTimeFormatter.format(new Date(route.criadoPor.data))}
                </p>
              </div>
            </div>
          </div>

          {route.edicoes.length > 0 ? (
            <div>
              <h3 className="text-sm font-extrabold text-violet-950 dark:text-violet-200">
                Edições
              </h3>
              <div className="mt-density-sm space-y-density-sm">
                {route.edicoes.map((edicao, idx) => (
                  <div key={idx} className="flex items-center gap-density-sm">
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white dark:bg-red-500">
                      {getInitial(edicao.nome)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-bold text-violet-950 dark:text-violet-100"
                        title={edicao.nome}
                      >
                        {edicao.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dateTimeFormatter.format(new Date(edicao.data))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-border pt-density-md">
            <span className="text-xs font-bold uppercase text-muted-foreground">Status</span>
            <span className="text-sm font-extrabold text-violet-950 dark:text-violet-200">
              {route.status}
            </span>
          </div>

          <div className="flex items-center gap-density-sm">
            <Select value={status} onValueChange={(v) => setStatus(v as StatusRota)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-none bg-emerald-500 font-bold text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              Salvar
            </Button>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase text-violet-950 dark:text-violet-200">
              Produtos ({route.produtos.length})
            </h3>
            <div className="mt-density-sm space-y-density-sm">
              {route.produtos.map((produto, idx) => (
                <div
                  key={produto.id}
                  className="flex items-center gap-density-sm rounded-lg border border-border p-density-sm"
                >
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-extrabold text-violet-950 dark:text-violet-100"
                      title={produto.produto || 'Produto'}
                    >
                      {produto.produto || 'Produto'}
                    </p>
                    <p className="text-sm text-muted-foreground">{produto.quantidade} Itens</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
