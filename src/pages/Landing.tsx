import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { ArrowRight, Link2, BarChart2, Palette, Youtube, ShoppingBag, Check } from 'lucide-react'
import { TagaShopBannerGrid } from '@/components/tagashop/TagaShopBanner'

const features = [
  { icon: Link2,      title: 'Todos os teus links',    desc: 'Partilha redes sociais, produtos, WhatsApp e muito mais num único link.' },
  { icon: Youtube,    title: 'Vídeo de apresentação',  desc: 'Incorpora um vídeo YouTube no topo da tua página. Sem custo extra.' },
  { icon: BarChart2,  title: 'Analytics integrado',    desc: 'Vê de onde vêm as visitas e quais os links mais clicados.' },
  { icon: Palette,    title: 'Personalização total',   desc: 'Personaliza cores, fontes e fundo para combinar com a tua marca.' },
  { icon: ShoppingBag,title: 'Produtos TagaShop',      desc: 'Integra a tua loja TagaShop directamente na bio.' },
]

const plans = [
  { name: 'Gratuito', price: '0', period: '', features: ['3 links', 'Analytics básico', 'Tema TAGATECH'] },
  { name: 'Creator',  price: '3 900', period: '/mês', highlight: true,
    features: ['Links ilimitados', 'Vídeo YouTube', 'Analytics completo', 'Cores e fontes personalizadas', 'TagaShop embutido'] },
]

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-surface-bg overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-blob top-[-120px] left-[-80px] w-[420px] h-[420px] bg-brand-600/30 animate-float-slow" />
      <div className="glow-blob top-[160px] right-[-120px] w-[380px] h-[380px] bg-accent-500/20 animate-float" />
      <div className="glow-blob bottom-[-160px] left-1/3 w-[460px] h-[460px] bg-brand-500/15 animate-float-slow" />

      <div className="relative">
        {/* Nav */}
        <nav className="flex items-center justify-between px-5 py-4 max-w-5xl mx-auto animate-fade-in">
          <Logo className="h-[114px]" />
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Entrar</Link>
            <Link to="/register" className="btn-primary text-sm">Começar grátis</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-4 py-20 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 text-brand-300 text-xs font-medium mb-6 border border-brand-500/20 animate-slide-up backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Plataforma de bio-link angolana
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5 animate-slide-up" style={{ animationDelay: '0.08s' }}>
            Partilha tudo com<br />
            <span className="gradient-text">um único link</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.16s' }}>
            Cria a tua página TagaLinks em minutos. Partilha na bio do Instagram, TikTok e WhatsApp.
            Os teus seguidores vêem tudo num só lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.24s' }}>
            <Link to="/register" className="btn-primary text-base px-7 py-3 flex items-center gap-2 group">
              Criar a minha página
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#features" className="btn-secondary text-base px-7 py-3">
              Ver funcionalidades
            </a>
          </div>
        </section>

        {/* Exemplo de página TagaLinks */}
        <section className="px-4 py-12 max-w-md mx-auto">
          <p className="text-center text-xs font-medium text-gray-500 uppercase tracking-wide mb-5 animate-fade-in">
            Exemplo de uma página TagaLinks
          </p>
          <div className="relative mx-auto w-full max-w-[300px] animate-slide-up">
            {/* Glow por trás do telemóvel */}
            <div className="glow-blob inset-0 m-auto w-3/4 h-3/4 bg-brand-500/25 animate-float-slow" />
            {/* Moldura tipo telemóvel */}
            <div className="relative rounded-[2.2rem] border-[6px] border-surface-border bg-surface-card p-1.5 shadow-glow-brand hover-lift">
              <img
                src="/images/IMG_8105.jpg"
                alt="Exemplo de página TagaLinks — Maria Make-Up"
                loading="lazy"
                draggable={false}
                className="w-full h-auto rounded-[1.7rem] select-none pointer-events-none"
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-4 py-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Tudo o que precisas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-interactive group">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-brand-500/25 group-hover:scale-110">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <p className="font-semibold text-white mb-1">{title}</p>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TagaShop — banners publicitários */}
        <section className="px-4 py-16 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 text-brand-300 text-xs font-medium mb-4 border border-brand-500/20">
              <img src="/tagashop/tagashop_semfundo.png" alt="" className="w-4 h-4 object-contain" />
              Powered by TagaShop
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Conecta a tua loja TagaShop</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Vende produtos físicos e digitais sem comissões e liga a tua loja directamente ao bio-link.
            </p>
          </div>
          <TagaShopBannerGrid className="[&>*:nth-child(n+3)]:hidden lg:[&>*:nth-child(n+3)]:block" />
          <div className="text-center mt-8">
            <a
              href="https://tagashop.site"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm px-6 py-2.5 inline-flex items-center gap-2 group"
            >
              Visitar tagashop.site
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </section>

        {/* Preços */}
        <section className="px-4 py-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Preços simples</h2>
          <p className="text-gray-400 text-center mb-10">Paga em Kwanza. Cancela quando quiseres.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch stagger">
            {plans.map(({ name, price, period, features: fs, highlight }) => (
              <div key={name} className={`card flex flex-col hover-lift ${
                highlight
                  ? 'border-brand-500/50 shadow-glow-soft sm:-translate-y-2 hover:shadow-glow-brand'
                  : 'hover:border-brand-500/30'
              }`}>
                {highlight && (
                  <span className="badge bg-gradient-tagatech text-white text-xs px-3 py-1 self-start mb-2 shadow-glow-soft">Mais popular</span>
                )}
                <p className="font-semibold text-white mb-1">{name}</p>
                <p className="text-3xl font-bold text-white mb-4">
                  {price} <span className="text-base font-normal text-gray-400">Kz{period}</span>
                </p>
                <ul className="space-y-2 flex-1 mb-5">
                  {fs.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`text-center text-sm py-2.5 rounded-xl font-medium transition-all ${
                  highlight ? 'btn-primary' : 'btn-secondary'
                }`}>
                  Começar
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="px-4 py-16 text-center">
          <div className="relative max-w-xl mx-auto bg-gradient-tagatech-subtle border border-brand-500/20 rounded-2xl p-8 overflow-hidden hover-lift">
            <div className="glow-blob top-[-60px] right-[-40px] w-48 h-48 bg-accent-500/20 animate-float" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-3">Pronto para começar?</h2>
              <p className="text-gray-400 mb-6">Cria a tua página grátis em menos de 2 minutos.</p>
              <Link to="/register" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2 group">
                Criar conta grátis
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-600 py-6 border-t border-surface-border">
          © {new Date().getFullYear()} TagaLinks · Parte do ecossistema TAGATECH Angola
        </footer>
      </div>
    </div>
  )
}
