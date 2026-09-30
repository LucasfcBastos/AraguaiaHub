import type { ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import Cadastro from './pages/Cadastro'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import { Toaster } from '@/components/ui/sonner'
import { ProductsProvider } from './hooks/useProductsStore'

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function App() {
  return (
    <ProductsProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cadastrar" element={<Cadastro />} />
        <Route
          path="/dashboard"
          element={
            <AppShell>
              <Dashboard />
            </AppShell>
          }
        />
        <Route
          path="/produtos"
          element={
            <AppShell>
              <Produtos />
            </AppShell>
          }
        />
      </Routes>
      <Toaster />
    </ProductsProvider>
  )
}
