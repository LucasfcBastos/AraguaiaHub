import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useProducts } from '../hooks/useProductsStore'

export type TipoRota = 'Entrada' | 'Saída'
export type StatusRota = 'Em separação' | 'Em trânsito' | 'Concluída'

export type MovimentacaoProduto = {
  id: string
  produto: string
  quantidade: string
}

export type NovaMovimentacao = {
  tipoRota: TipoRota
  origem: string
  destino: string
  status: StatusRota
  produtos: MovimentacaoProduto[]
}

const statusOptions: StatusRota[] = ['Em separação', 'Em trânsito', 'Concluída']

function emptyProduto(): MovimentacaoProduto {
  return { id: crypto.randomUUID(), produto: '', quantidade: '' }
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transferId: number
  onSave: (data: NovaMovimentacao) => void
}

export default function CreateMovimentacaoDialog({
  open,
  onOpenChange,
  transferId,
  onSave,
}: Props) {
  const [tipoRota, setTipoRota] = useState<TipoRota>('Entrada')
  const [status, setStatus] = useState<StatusRota>('Em separação')
  const [origem, setOrigem] = useState('')
  const [destino, setDestino] = useState('')
  const [produtos, setProdutos] = useState<MovimentacaoProduto[]>([emptyProduto()])

  // Reset the form every time the dialog is opened.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setTipoRota('Entrada')
      setStatus('Em separação')
      setOrigem('')
      setDestino('')
      setProdutos([emptyProduto()])
    }
  }

  const { produtos: catalogProdutos } = useProducts()

  const addProduto = () => {
    setProdutos((prev) => [...prev, emptyProduto()])
  }

  const removeProduto = (id: string) => {
    setProdutos((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev))
  }

  const updateProduto = (id: string, patch: Partial<MovimentacaoProduto>) => {
    setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const handleQuantidadeChange = (id: string, raw: string) => {
    // Only digits, "/" and whitespace are allowed (plain numbers or fractions).
    const sanitized = raw.replace(/[^0-9/\s]/g, '')
    updateProduto(id, { quantidade: sanitized })
  }

  const handleSave = () => {
    onSave({ tipoRota, origem, destino, status, produtos })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-violet-950 dark:text-violet-200">
            Criar Movimentação
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Transferência #{transferId}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-density-lg pr-1">
          <div className="grid grid-cols-1 gap-density-lg sm:grid-cols-2">
            <div className="space-y-density-xs">
              <label className="text-sm font-semibold text-violet-950 dark:text-violet-200">
                Tipo de Rota
              </label>
              <Select value={tipoRota} onValueChange={(v) => setTipoRota(v as TipoRota)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Saída">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-density-xs">
              <label className="text-sm font-semibold text-violet-950 dark:text-violet-200">
                Status da Rota
              </label>
              <Select value={status} onValueChange={(v) => setStatus(v as StatusRota)}>
                <SelectTrigger>
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
            </div>

            <div className="space-y-density-xs">
              <label className="text-sm font-semibold text-violet-950 dark:text-violet-200">
                Origem
              </label>
              <Input
                placeholder="Ex: Fábrica Anápolis"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
              />
            </div>

            <div className="space-y-density-xs">
              <label className="text-sm font-semibold text-violet-950 dark:text-violet-200">
                Destino
              </label>
              <Input
                placeholder="Ex: Loja Senador Canedo"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-violet-950 dark:text-violet-200">
                Produtos
              </span>
              <Button
                type="button"
                onClick={addProduto}
                className="bg-emerald-500 font-bold text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Adicionar Produto
              </Button>
            </div>

            <div className="mt-density-md space-y-density-md">
              {produtos.map((produto, index) => (
                <div key={produto.id} className="flex items-start gap-density-sm">
                  <div className="mt-2 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </div>

                  <div className="flex-1 grid grid-cols-[2fr_1fr] gap-density-sm">
                    <Select
                      value={produto.produto}
                      onValueChange={(v) => updateProduto(produto.id, { produto: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar produto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogProdutos.map((p) => (
                          <SelectItem key={p.id} value={p.nome}>
                            {p.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Ex: 60"
                      inputMode="text"
                      value={produto.quantidade}
                      onChange={(e) => handleQuantidadeChange(produto.id, e.target.value)}
                    />
                  </div>

                  {produtos.length > 1 ? (
                    <button
                      type="button"
                      aria-label="Remover produto"
                      onClick={() => removeProduto(produto.id)}
                      className="mt-2 flex-none text-destructive/80 transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  ) : (
                    <div className="mt-2 h-5 w-5 flex-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="border-t border-border pt-density-md">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-violet-950 font-bold text-white hover:bg-violet-900 dark:bg-violet-900 dark:hover:bg-violet-800"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
