import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { apiFetch } from '@/lib/api'
import type { NovaMovimentacao, StatusRota, TipoRota } from '../components/CreateMovimentacaoDialog'
import type { RouteDetails } from '../components/RouteDetailsSheet'

type MovimentacaoApi = {
  id: number
  tipo_rota: TipoRota
  status: StatusRota
  origem: string
  destino: string
  criado_por_nome: string
  criado_em: string
  produtos: { id: number; produto: string; quantidade: string }[]
  edicoes: { id: number; nome: string; data: string }[]
}

function toRoute(m: MovimentacaoApi): RouteDetails {
  return {
    id: `#${m.id}`,
    status: m.status,
    origin: m.origem,
    destination: m.destino,
    produtos: m.produtos.map((p) => ({ ...p, id: String(p.id) })),
    criadoPor: { nome: m.criado_por_nome, data: m.criado_em },
    edicoes: m.edicoes.map(({ nome, data }) => ({ nome, data })),
  }
}

// O id exibido é "#N"; a API usa só o número.
function apiId(routeId: string) {
  return routeId.replace(/^#/, '')
}

export function useMovimentacoes() {
  const [routes, setRoutes] = useState<RouteDetails[]>([])

  useEffect(() => {
    apiFetch<MovimentacaoApi[]>('/movimentacoes')
      .then((data) => setRoutes(data.map(toRoute)))
      .catch((err: Error) =>
        toast.error('Erro ao carregar movimentações', { description: err.message })
      )
  }, [])

  const createRoute = useCallback(async (data: NovaMovimentacao, criadoPorNome: string) => {
    const criada = await apiFetch<MovimentacaoApi>('/movimentacoes', {
      method: 'POST',
      body: JSON.stringify({
        tipo_rota: data.tipoRota,
        status: data.status,
        origem: data.origem,
        destino: data.destino,
        criado_por_nome: criadoPorNome,
        produtos: data.produtos.map(({ produto, quantidade }) => ({ produto, quantidade })),
      }),
    })
    setRoutes((prev) => [toRoute(criada), ...prev])
  }, [])

  const updateStatus = useCallback(
    async (routeId: string, status: StatusRota, editadoPorNome: string) => {
      const atualizada = await apiFetch<MovimentacaoApi>(`/movimentacoes/${apiId(routeId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, editado_por_nome: editadoPorNome }),
      })
      setRoutes((prev) => prev.map((route) => (route.id === routeId ? toRoute(atualizada) : route)))
    },
    []
  )

  // Próximo número sequencial ("Transferência #N") exibido no modal.
  const nextTransferId =
    routes.reduce((max, route) => Math.max(max, Number(apiId(route.id)) || 0), 0) + 1

  return { routes, nextTransferId, createRoute, updateStatus }
}
