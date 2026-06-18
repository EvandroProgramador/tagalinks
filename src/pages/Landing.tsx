import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { ArrowUpRight, Link2, BarChart2, Palette, ShoppingBag, MessageCircle, Check } from 'lucide-react'
import { TagaShopBannerGrid } from '@/components/tagashop/TagaShopBanner'
import { YouTubeIcon } from '@/components/ui/BrandIcons'

const features = [
  { icon: Link2,       title: 'Todos os teus links',    desc: 'Partilha redes sociais, produtos, WhatsApp e muito mais num único link.' },
  { icon: YouTubeIcon, title: 'Vídeo de apresentação',  desc: 'Incorpora um vídeo YouTube no topo da tua página. Sem custo extra.' },
  { icon: BarChart2,   title: 'Analytics integrado',    desc: 'Vê de onde vêm as visitas e quais os links mais clicados.' },
  { icon: Palette,     title: 'Personalização total',   desc: 'Personaliza cores, fontes e fundo para combinar com a tua marca.' },
  { icon: ShoppingBag, title: 'Produtos TagaShop',      desc: 'Integra a tua loja TagaShop directamente na bio.' },
  { icon: MessageCircle, title: 'Contacto directo',     desc: 'Botões de WhatsApp, e-mail e telefone para te contactarem num toque.' },
]

const plans = [
  { name: 'Gratuito', price: '0', period: '', features: ['3 links', 'Analytics básico', 'Tema TAGATECH'] },
  { name: 'Creator',  price: '2 900', period: '/mês', highlight: true,
    features: ['Links ilimitados', 'Vídeo de apresentação', 'Analytics completo', 'Cores e fontes personalizadas', 'TagaShop embutido'] },
]

/* Eyebrow mono + costura de gradiente — o dispositivo estrutural da página */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="eyebrow whitespace-nowrap">{children}</span>
      <span className="seam" />
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-dvh bg-surface-bg">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 max-w-6xl mx-auto animate-fade-in">
        <Logo className="h-[114px]" />
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://www.youtube.com/@tagatech"
            target="_blank" rel="noopener noreferrer"
            className="btn-ghost text-sm hidden sm:inline-flex"
          >
            <YouTubeIcon className="w-4 h-4" />
            Tutorial
          </a>
          <Link to="/login" className="btn-ghost text-sm">Entrar</Link>
          <Link to="/register" className="btn-primary text-sm">Começar grátis</Link>
        </div>
      </nav>

      {/* Hero — assimétrico: tese à esquerda, demo viva à direita */}
      <section className="px-5 pt-12 pb-20 max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">
        <div className="animate-slide-up">
          <Eyebrow>Plataforma bio-link · Angola</Eyebrow>
          <h1 className="font-display font-extrabold text-white leading-[0.9] tracking-tight text-6xl sm:text-7xl mt-6 mb-6">
            Um link.<br />
            <span className="gradient-text">Tudo teu.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mb-8">
            Cria a tua página TagaLinks em minutos. Partilha na bio do Instagram, TikTok e
            WhatsApp — os teus seguidores vêem tudo num só lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link to="/register" className="btn-primary text-base px-7 py-3 group">
              Criar a minha página
              <ArrowUpRight className="w-4 h-4 tile-arrow" />
            </Link>
            <a href="#features" className="btn-secondary text-base px-7 py-3">
              Ver funcionalidades
            </a>
          </div>
        </div>

        {/* Demo: moldura de telemóvel com exemplo real */}
        <div className="relative mx-auto w-full max-w-[300px] animate-slide-up" style={{ animationDelay: '0.12s' }}>
          <div className="absolute inset-0 m-auto w-3/4 h-3/4 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
          <div className="relative rounded-[2.2rem] border-[6px] border-surface-border bg-surface-card p-1.5 shadow-[0_30px_80px_-30px_rgba(124,58,237,0.5)]">
            <img
              src="/images/IMG_8105.jpg"
              alt="Exemplo de página TagaLinks — Maria Make-Up"
              loading="lazy"
              draggable={false}
              className="w-full h-auto rounded-[1.7rem] select-none pointer-events-none"
            />
          </div>
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 badge bg-surface-elevated text-gray-400 border border-surface-border whitespace-nowrap">
            Exemplo real
          </span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-5 py-16 max-w-6xl mx-auto">
        <div className="max-w-md mb-10">
          <Eyebrow>O que tens</Eyebrow>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-4">Tudo o que precisas</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group relative overflow-hidden card-interactive pl-6">
              <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-edge origin-center scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
              <div className="w-10 h-10 rounded-lg bg-brand-500/15 flex items-center justify-center mb-3 transition-colors group-hover:bg-brand-500/25">
                <Icon className="w-5 h-5 text-brand-300" />
              </div>
              <p className="font-display font-bold text-white mb-1">{title}</p>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TagaShop */}
      <section className="px-5 py-16 max-w-6xl mx-auto">
        <div className="max-w-md mb-10">
          <Eyebrow>Powered by TagaShop</Eyebrow>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-4 mb-2">Conecta a tua loja</h2>
          <p className="text-gray-400">
            Vende produtos físicos e digitais sem comissões e liga a tua loja directamente ao bio-link.
          </p>
        </div>
        <TagaShopBannerGrid className="[&>*:nth-child(n+3)]:hidden lg:[&>*:nth-child(n+3)]:block" />
        <div className="mt-8">
          <a
            href="https://tagashop.site"
            target="_blank" rel="noopener noreferrer"
            className="btn-secondary text-sm px-6 py-2.5 group"
          >
            Visitar tagashop.site
            <ArrowUpRight className="w-4 h-4 tile-arrow" />
          </a>
        </div>
      </section>

      {/* Preços */}
      <section className="px-5 py-16 max-w-3xl mx-auto">
        <div className="max-w-md mb-10">
          <Eyebrow>Preços em Kwanza</Eyebrow>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-4 mb-2">Simples e directo</h2>
          <p className="text-gray-400">Paga em Kwanza. Cancela quando quiseres.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch stagger">
          {plans.map(({ name, price, period, features: fs, highlight }) => (
            <div key={name} className={`relative overflow-hidden card flex flex-col ${
              highlight ? 'border-brand-500/50' : ''
            }`}>
              {highlight && (
                <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-edge" />
              )}
              {highlight && (
                <span className="badge bg-gradient-tagatech text-white self-start mb-3">Mais popular</span>
              )}
              <p className="eyebrow mb-2">{name}</p>
              <p className="mb-5">
                <span className="font-mono font-bold text-white text-4xl tracking-tight">{price}</span>
                <span className="text-base text-gray-400"> Kz{period}</span>
              </p>
              <ul className="space-y-2.5 flex-1 mb-6">
                {fs.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-accent-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`text-center text-sm py-2.5 ${highlight ? 'btn-primary' : 'btn-secondary'}`}>
                Começar
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final — um único glow contido */}
      <section className="px-5 py-16">
        <div className="relative max-w-2xl mx-auto bg-gradient-tagatech-subtle border border-brand-500/20 rounded-2xl p-8 sm:p-10 overflow-hidden">
          <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-accent-500/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Pronto para começar?</h2>
            <p className="text-gray-400 mb-6">Cria a tua página grátis em menos de 2 minutos.</p>
            <Link to="/register" className="btn-primary text-base px-8 py-3 group">
              Criar conta grátis
              <ArrowUpRight className="w-4 h-4 tile-arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-surface-border">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="https://www.youtube.com/@tagatech"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-300 transition-colors"
          >
            <YouTubeIcon className="w-4 h-4" />
            Ver tutoriais no YouTube
          </a>
          <p className="eyebrow text-gray-600">© {new Date().getFullYear()} TagaLinks — TAGATECH Angola</p>
        </div>
      </footer>
    </div>
  )
}
