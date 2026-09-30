import { useState } from 'react'
import { Warehouse, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/sonner'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { getDisplayName } from '../utils/userDisplay'
import CreateMovimentacaoDialog, {
  type NovaMovimentacao,
  type StatusRota,
} from '../components/CreateMovimentacaoDialog'
import RouteDetailsSheet, { type MovimentacaoEvento } from '../components/RouteDetailsSheet'
import { useProducts } from '../hooks/useProductsStore'
import { useMovimentacoes } from '../hooks/useMovimentacoes'

export default function Dashboard() {
  const { produtos } = useProducts()
  const { user } = useCurrentUser()
  const { routes, nextTransferId, createRoute, updateStatus } = useMovimentacoes()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? null

  const totalRoutesToday = routes.length
  const concludedRoutesToday = routes.filter((route) => route.status === 'Concluída').length

  const emSeparacaoCount = routes.filter((route) => route.status === 'Em separação').length
  const emTransitoRoutes = routes.filter((route) => route.status === 'Em trânsito')
  const emTransitoCount = emTransitoRoutes.length
  const itensEmTransito = emTransitoRoutes.reduce(
    (sum, route) =>
      sum + route.produtos.reduce((prodSum, produto) => prodSum + (Number(produto.quantidade) || 0), 0),
    0
  )
  const percentualConcluido =
    totalRoutesToday === 0
      ? 0
      : Math.min(100, Math.max(0, Math.round((concludedRoutesToday / totalRoutesToday) * 100)))

  const stats = [
    { value: String(emSeparacaoCount), label: 'Em Separação' },
    { value: String(emTransitoCount), label: 'Em Trânsito' },
    { value: String(itensEmTransito), label: 'Itens em Trânsito' },
    { value: `${percentualConcluido}%`, label: 'Entregas Concluídas' },
  ]

  const handleSave = async (data: NovaMovimentacao) => {
    const nome = getDisplayName(user)
    try {
      await createRoute(
        { ...data, origem: data.origem || 'Origem', destino: data.destino || 'Destino' },
        nome
      )
      setDialogOpen(false)
    } catch (err) {
      toast.error('Erro ao salvar movimentação', { description: (err as Error).message })
    }
  }

  const handleRowClick = (routeId: string) => {
    setSelectedRouteId(routeId)
    setDetailsOpen(true)
  }

  const handleSaveDetails = async (
    routeId: string,
    status: StatusRota,
    edicao: MovimentacaoEvento
  ) => {
    try {
      await updateStatus(routeId, status, edicao.nome)
    } catch (err) {
      toast.error('Erro ao atualizar status', { description: (err as Error).message })
    }
  }

  const handleOpenDialog = () => {
    if (produtos.length === 0) {
      toast.error('Nenhum produto registrado', {
        description: 'Cadastre pelo menos 1 produto no sistema antes de criar uma movimentação.',
      })
      return
    }
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen flex-1 bg-emerald-50/40 dark:bg-background">
      <div className="mx-auto max-w-6xl px-8 py-8">
        {/* Banner */}
        <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-violet-950">
          <Warehouse className="absolute -right-4 -top-6 h-56 w-56 text-white/5" />
          <div className="absolute inset-0 flex items-center justify-end px-6">
            <button
              type="button"
              onClick={handleOpenDialog}
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-retool-sm transition-colors hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              Criar Movimentação
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mt-6">
          <button
            type="button"
            className="rounded-lg bg-violet-950 px-5 py-2.5 text-sm font-bold text-white dark:bg-violet-900"
          >
            Hoje
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="text-2xl font-extrabold text-violet-900 dark:text-violet-300">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-bold text-violet-950 dark:text-violet-200">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Routes list */}
        <div className="mt-6 rounded-xl border border-border bg-card">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-lg font-extrabold text-violet-950 dark:text-violet-200">
              Lista de Rotas
            </h2>
            <p className="mt-1 text-sm text-violet-800/80 dark:text-violet-300/80">
              {concludedRoutesToday} das {totalRoutesToday} totais foram concluídas hoje
            </p>
          </div>

          <div className="divide-y divide-border">
            {routes.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Nenhuma rota registrada hoje. Clique em "Criar Movimentação" para adicionar a primeira.
              </p>
            ) : (
              routes.map((route, index) => (
              <div
                key={`${route.id}-${index}`}
                role="button"
                tabIndex={0}
                onClick={() => handleRowClick(route.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleRowClick(route.id)
                }}
                className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-extrabold text-violet-950 dark:text-violet-100">
                      Transferência {route.id}
                    </span>
                    <Badge className="flex-none border-transparent bg-violet-800 font-bold text-white hover:bg-violet-800 dark:bg-violet-700">
                      {route.status}
                    </Badge>
                  </div>
                  <p
                    className="mt-1 truncate text-sm text-violet-800/70 dark:text-violet-300/70"
                    title={`${route.origin} \u2192 ${route.destination}`}
                  >
                    {route.origin} &rarr; {route.destination}
                  </p>
                </div>

                <div className="flex flex-none items-center gap-4">
                  <div className="text-right">
                    <div className="font-extrabold text-violet-950 dark:text-violet-100">
                      {route.produtos.length}
                    </div>
                    <div className="text-sm text-violet-800/70 dark:text-violet-300/70">
                      Produtos
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-violet-900 dark:text-violet-300" />
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      <CreateMovimentacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transferId={nextTransferId}
        onSave={handleSave}
      />

      <RouteDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        route={selectedRoute}
        onSave={handleSaveDetails}
      />
    </div>
  )
}
