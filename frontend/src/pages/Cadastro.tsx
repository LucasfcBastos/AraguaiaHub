import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/sonner'
import { apiFetch } from '@/lib/api'

const PURPLE = '#5B21B6'
const GREEN = '#22C55E'
const GREEN_DARK = '#16A34A'

type FormData = {
  nomeCompleto: string
  cpf: string
  email: string
  confirmarEmail: string
  senha: string
  confirmarSenha: string
}

const initialData: FormData = {
  nomeCompleto: '',
  cpf: '',
  email: '',
  confirmarEmail: '',
  senha: '',
  confirmarSenha: '',
}

// Mantém apenas números e formata como xxx.xxx.xxx-xx (máx. 11 dígitos)
function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  let formatted = digits
  if (digits.length > 9) {
    formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  } else if (digits.length > 6) {
    formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  } else if (digits.length > 3) {
    formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`
  }
  return formatted
}

export default function Cadastro() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(initialData)

  const setField = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await apiFetch('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          full_name: form.nomeCompleto,
          cpf: form.cpf,
          email: form.email,
          senha: form.senha,
        }),
      })
    } catch (err) {
      toast.error('Erro no cadastro', { description: (err as Error).message })
      return
    }
    navigate('/dashboard')
  }

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-6"
      style={{
        background:
          'linear-gradient(135deg, #22C55E 0%, #15803D 35%, #1E3A8A 70%, #4C1D95 100%)',
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-white px-8 py-8 shadow-retool-lg">
        <h1
          className="mb-6 text-center text-3xl font-extrabold tracking-tight"
          style={{ color: PURPLE }}
        >
          Araguaia Hub
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome" style={{ color: PURPLE }}>
              Nome completo *
            </Label>
            <Input
              id="nome"
              placeholder="Lucas ..."
              value={form.nomeCompleto}
              onChange={(e) => setField('nomeCompleto', e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cpf" style={{ color: PURPLE }}>
              CPF *
            </Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              value={form.cpf}
              onChange={(e) => setField('cpf', formatCpf(e.target.value))}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" style={{ color: PURPLE }}>
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@gmail.com"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmarEmail" style={{ color: PURPLE }}>
              Confirmar E-mail *
            </Label>
            <Input
              id="confirmarEmail"
              type="email"
              placeholder="email@gmail.com"
              value={form.confirmarEmail}
              onChange={(e) => setField('confirmarEmail', e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha" style={{ color: PURPLE }}>
              Senha *
            </Label>
            <Input
              id="senha"
              type="password"
              placeholder="******"
              value={form.senha}
              onChange={(e) => setField('senha', e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmarSenha" style={{ color: PURPLE }}>
              Confirmar Senha *
            </Label>
            <Input
              id="confirmarSenha"
              type="password"
              placeholder="******"
              value={form.confirmarSenha}
              onChange={(e) => setField('confirmarSenha', e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-md py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:brightness-90"
            style={{ backgroundColor: GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GREEN_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
          >
            Cadastro
          </button>

          <p className="text-center text-sm text-foreground">
            Já tenho cadastro, vamos{' '}
            <Link to="/" className="font-bold" style={{ color: PURPLE }}>
              LOGAR
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
