import { useMemo, useState } from 'react'
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useProducts, getProdutoStatus, type Produto } from '../hooks/useProductsStore'
import CreateProdutoDialog from '../components/CreateProdutoDialog'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function statusBadgeClass(status: string) {
  if (status === 'Abaixo do Mínimo') {
    return 'border-transparent bg-destructive font-bold text-destructive-foreground hover:bg-destructive'
  }
  if (status === 'Acima do Máximo') {
    return 'border-transparent bg-warning font-bold text-warning-foreground hover:bg-warning'
  }
  return 'border-transparent bg-violet-800 font-bold text-white hover:bg-violet-800 dark:bg-violet-700'
}

export default function Produtos() {
  const { produtos } = useProducts()
  const [dialogOpen, setDialogOpen] = useState(false)

  const quantidadeDeProdutos = produtos.length
  const quantidadeNoEstoque = produtos.reduce((sum, p) => sum + p.quantidade, 0)
  const abaixoDoMinimo = produtos.filter((p) => getProdutoStatus(p) === 'Abaixo do Mínimo').length
  const acimaDoMaximo = produtos.filter((p) => getProdutoStatus(p) === 'Acima do Máximo').length

  const stats = [
    { value: String(quantidadeDeProdutos), label: 'Quantidade de Produtos' },
    { value: String(quantidadeNoEstoque), label: 'Quantidade no Estoque' },
    { value: String(abaixoDoMinimo), label: 'Abaixo do Mínimo' },
    { value: String(acimaDoMaximo), label: 'Acima do Máximo' },
  ]

  const columns = useMemo<ColumnDef<Produto>[]>(
    () => [
      {
        accessorKey: 'nome',
        header: 'Nome',
        cell: ({ row }) => (
          <span
            className="block max-w-[220px] truncate font-extrabold text-violet-950 dark:text-violet-100"
            title={row.original.nome}
          >
            {row.original.nome}
          </span>
        ),
      },
      {
        accessorKey: 'quantidade',
        header: 'Quantidade',
        cell: ({ row }) => (
          <span className="font-bold text-violet-950 dark:text-violet-100">
            {row.original.quantidade}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = getProdutoStatus(row.original)
          return <Badge className={statusBadgeClass(status)}>{status}</Badge>
        },
      },
      {
        accessorKey: 'preco',
        header: 'Preço',
        cell: ({ row }) => (
          <span className="font-bold text-violet-950 dark:text-violet-100">
            {currencyFormatter.format(row.original.preco)}
          </span>
        ),
      },
      {
        accessorKey: 'atualizacao',
        header: 'Atualização',
        cell: ({ row }) => (
          <span className="font-bold text-violet-950 dark:text-violet-100">
            {dateFormatter.format(new Date(row.original.atualizacao))}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: () => <ChevronRight className="h-4 w-4 text-violet-900 dark:text-violet-300" />,
      },
    ],
    []
  )

  const table = useReactTable({
    data: produtos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="min-h-screen flex-1 bg-emerald-50/40 dark:bg-background">
      <div className="mx-auto max-w-6xl px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-violet-950 dark:text-violet-200">
            Produtos
          </h1>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-retool-sm transition-colors hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            Criar Produto
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <div className="text-2xl font-extrabold text-violet-900 dark:text-violet-300">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-bold text-violet-950 dark:text-violet-200">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Products table */}
        <div className="mt-6 rounded-xl border border-border bg-card">
          {produtos.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nenhum produto registrado. Clique em "Criar Produto" para adicionar o primeiro.
            </p>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-violet-800/80 dark:text-violet-300/80"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <CreateProdutoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        produtoNumber={produtos.length + 1}
      />
    </div>
  )
}
