import { useState } from 'react'
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
import { toast } from '@/components/ui/sonner'
import { ApiError } from '@/lib/api'
import { useProducts, type Produto } from '../hooks/useProductsStore'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  produtoNumber: number
}

export default function CreateProdutoDialog({ open, onOpenChange, produtoNumber }: Props) {
  const { produtos, addProduto } = useProducts()

  const [nome, setNome] = useState('')
  const [quantidadeAtual, setQuantidadeAtual] = useState('')
  const [quantidadeMinima, setQuantidadeMinima] = useState('')
  const [quantidadeMaxima, setQuantidadeMaxima] = useState('')
  const [preco, setPreco] = useState('')

  // Reset the form every time the dialog is opened.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setNome('')
      setQuantidadeAtual('')
      setQuantidadeMinima('')
      setQuantidadeMaxima('')
      setPreco('')
    }
  }

  const handleQuantidadeChange = (setter: (v: string) => void, raw: string) => {
    // Only digits are allowed (whole numbers of items).
    setter(raw.replace(/[^0-9]/g, ''))
  }

  const handlePrecoChange = (raw: string) => {
    // Only digits and a single "," decimal separator are allowed.
    let sanitized = raw.replace(/[^0-9,]/g, '')
    const firstComma = sanitized.indexOf(',')
    if (firstComma !== -1) {
      sanitized =
        sanitized.slice(0, firstComma + 1) + sanitized.slice(firstComma + 1).replace(/,/g, '')
    }
    setPreco(sanitized)
  }

  const handleSave = async () => {
    const nomeTrimmed = nome.trim()

    if (!nomeTrimmed) {
      toast.error('Nome do produto obrigatório', {
        description: 'Informe um nome para o produto.',
      })
      return
    }

    const duplicated = produtos.some(
      (p: Produto) => p.nome.trim().toLowerCase() === nomeTrimmed.toLowerCase()
    )
    if (duplicated) {
      toast.error('Nome de produto já existe', {
        description: 'Já existe um produto cadastrado com esse nome. Escolha outro nome.',
      })
      return
    }

    if (!quantidadeAtual || !quantidadeMinima || !quantidadeMaxima) {
      toast.error('Preencha as quantidades', {
        description: 'Quantidade atual, mínima e máxima são obrigatórias.',
      })
      return
    }

    const precoNormalizado = preco.replace(',', '.')
    if (!preco || Number.isNaN(parseFloat(precoNormalizado))) {
      toast.error('Preço do produto inválido', {
        description: 'Informe o preço do produto, ex: 50,00.',
      })
      return
    }

    try {
      await addProduto({
        nome: nomeTrimmed,
        quantidade: parseInt(quantidadeAtual, 10),
        minimo: parseInt(quantidadeMinima, 10),
        maximo: parseInt(quantidadeMaxima, 10),
        preco: parseFloat(precoNormalizado),
      })
    } catch (err) {
      const duplicado = err instanceof ApiError && err.status === 409
      toast.error(duplicado ? 'Nome de produto já existe' : 'Erro ao salvar produto', {
        description: (err as Error).message,
      })
      return
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-violet-950 dark:text-violet-200">
            Criar Produto
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Produto #{produtoNumber}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-density-lg pr-1">
          <div className="grid grid-cols-1 gap-density-lg sm:grid-cols-2">
            <div className="space-y-density-xs">
              <label className="text-sm font-semibold text-violet-950 dark:text-violet-200">
                Nome do Produto *
              </label>
              <Input
                placeholder="Ex: Pulverizante"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="space-y-density-xs">
              <label className="text-sm font-semibold text-violet-950 dark:text-violet-200">
                Quantidade Atual *
              </label>
              <Input
                placeholder="Ex: 40"
                inputMode="numeric"
                value={quantidadeAtual}
                onChange={(e) => handleQuantidadeChange(setQuantidadeAtual, e.target.value)}
              />
            </div>

            <div className="space-y-density-xs">
              <label className="text-sm font-semibold text-violet-950 dark:text-violet-200">
                Quantidade Mínima *
              </label>
              <Input
                placeholder="Ex: 20"
                inputMode="numeric"
                value={quantidadeMinima}
                onChange={(e) => handleQuantidadeChange(setQuantidadeMinima, e.target.value)}
              />
            </div>

            <div className="space-y-density-xs">
              <label className="text-sm font-semibold text-violet-950 dark:text-violet-200">
                Quantidade Máxima *
              </label>
              <Input
                placeholder="Ex: 60"
                inputMode="numeric"
                value={quantidadeMaxima}
                onChange={(e) => handleQuantidadeChange(setQuantidadeMaxima, e.target.value)}
              />
            </div>

            <div className="space-y-density-xs">
              <label className="text-sm font-semibold text-violet-950 dark:text-violet-200">
                Preço do Produto *
              </label>
              <Input
                placeholder="Ex: 50,00"
                inputMode="decimal"
                value={preco}
                onChange={(e) => handlePrecoChange(e.target.value)}
              />
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
