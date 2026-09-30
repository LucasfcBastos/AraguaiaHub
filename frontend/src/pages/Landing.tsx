import { useNavigate } from 'react-router-dom'
import heroImage from '../assets/araguaia-hero.png'

// Verde dos botões da identidade visual do Araguaia Hub
const PURPLE = '#5B21B6'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <span
          className="text-2xl font-extrabold tracking-tight"
          style={{ color: PURPLE }}
        >
          Araguaia Hub
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-md bg-[#22C55E] px-8 py-2.5 text-sm font-bold uppercase text-white transition-colors hover:bg-[#16A34A]"
          >
            Logar
          </button>
          <button
            onClick={() => navigate('/cadastrar')}
            className="rounded-md bg-[#22C55E] px-8 py-2.5 text-sm font-bold uppercase text-white transition-colors hover:bg-[#16A34A]"
          >
            Cadastrar
          </button>
        </div>
      </header>

      {/* Imagem de fundo preenchendo toda a tela */}
      <main className="relative flex-1 overflow-hidden">
        <img
          src={heroImage}
          alt="Araguaia Hub - operações agropecuárias"
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: 'cover' }}
        />
      </main>
    </div>
  )
}
