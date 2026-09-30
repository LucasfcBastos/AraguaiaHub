import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from '@/components/ui/sonner'
import { apiFetch } from '@/lib/api'

export type ProdutoStatus = 'Abaixo do Mínimo' | 'Normal' | 'Acima do Máximo'

export type Produto = {
  id: string
  nome: string
  quantidade: number
  minimo: number
  maximo: number
  preco: number
  atualizacao: string // ISO date
}

type ProdutoApi = Omit<Produto, 'id'> & { id: number }

function fromApi(produto: ProdutoApi): Produto {
  return { ...produto, id: String(produto.id) }
}

// eslint-disable-next-line react-refresh/only-export-components
export function getProdutoStatus(produto: Produto): ProdutoStatus {
  if (produto.quantidade < produto.minimo) return 'Abaixo do Mínimo'
  if (produto.quantidade > produto.maximo) return 'Acima do Máximo'
  return 'Normal'
}

type ProductsContextValue = {
  produtos: Produto[]
  addProduto: (produto: Omit<Produto, 'id' | 'atualizacao'>) => Promise<void>
}

const ProductsContext = createContext<ProductsContextValue | null>(null)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => {
    apiFetch<ProdutoApi[]>('/produtos')
      .then((data) => setProdutos(data.map(fromApi)))
      .catch((err: Error) =>
        toast.error('Erro ao carregar produtos', { description: err.message })
      )
  }, [])

  // Lança ApiError em caso de falha (ex.: 409 para nome duplicado).
  const addProduto = useCallback(async (produto: Omit<Produto, 'id' | 'atualizacao'>) => {
    const criado = await apiFetch<ProdutoApi>('/produtos', {
      method: 'POST',
      body: JSON.stringify(produto),
    })
    setProdutos((prev) => [fromApi(criado), ...prev])
  }, [])

  const value = useMemo(() => ({ produtos, addProduto }), [produtos, addProduto])

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider')
  return ctx
}
