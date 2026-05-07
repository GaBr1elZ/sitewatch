import Link from 'next/link';

/* ─── Static data ────────────────────────────────────── */
const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Verificação a cada 1 min',
    desc: 'Pings automáticos em todos os seus domínios, sem intervenção manual.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Histórico de latência',
    desc: 'Gráficos de tempo de resposta e barras de uptime para cada site.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: 'Status em tempo real',
    desc: 'Veja imediatamente quais sites estão online ou offline no painel.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'Autenticação segura',
    desc: 'Login e cadastro com sessão JWT de 7 dias, sem necessidade de configuração.',
  },
];

const DEMO_SITES = [
  { name: 'sitewatch.dev',      uptime: '99.98%', ms: '42ms',  online: true  },
  { name: 'api.sitewatch.dev',  uptime: '99.93%', ms: '88ms',  online: true  },
  { name: 'blog.sitewatch.dev', uptime: '100.00%', ms: '31ms', online: true  },
  { name: 'old.sitewatch.dev',  uptime: '94.20%', ms: '—',     online: false },
];

const STATS = [
  { value: '99.9%', label: 'Uptime médio' },
  { value: '<1min', label: 'Tempo de detecção' },
  { value: '3',     label: 'Sites no plano free' },
];

/* ─── Page ───────────────────────────────────────────── */
export default function Home() {
  return (
    <div style={{ background: 'var(--bg-900)', minHeight: '100vh', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Background ornaments ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div className="hero-orb" style={{ top: '-160px', left: '-120px' }} />
        <div className="hero-orb warm" style={{ top: '30%', right: '-160px' }} />
        <div className="hero-orb small" style={{ bottom: '10%', left: '30%', opacity: 0.4 }} />
        <div className="grain" />
        {/* Subtle grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          opacity: 0.25,
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
        }} />
      </div>

      {/* ── Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6, 13, 22, 0.82)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 1140, margin: '0 auto',
          padding: '0 32px',
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16,
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-warm))',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px var(--accent-glow)',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a1420" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              SiteWatch
            </span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" className="btn btn-ghost btn-sm" style={{ fontSize: 13 }}>
              Entrar
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm" style={{ fontSize: 13 }}>
              Criar conta grátis
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1140, margin: '0 auto', padding: '96px 32px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Left — copy */}
          <div>
            <div className="fade-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--accent-glow)',
              border: '1px solid rgba(34,211,238,0.3)',
              borderRadius: 999,
              padding: '5px 14px',
              fontSize: 12, fontWeight: 700,
              color: 'var(--accent)',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              marginBottom: 24,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-green 2s infinite' }} />
              Sistema operacional
            </div>

            <h1 className="fade-up fade-delay-1" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 4vw, 58px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: 20,
            }}>
              Saiba na hora quando seus sites ficam fora do ar.
            </h1>

            <p className="fade-up fade-delay-2" style={{
              fontSize: 17, lineHeight: 1.75,
              color: 'var(--text-secondary)',
              maxWidth: 460, marginBottom: 36,
            }}>
              Monitore URLs, acompanhe latência e histórico de pings em tempo real — tudo num painel limpo e rápido.
            </p>

            <div className="fade-up fade-delay-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/register" className="btn btn-primary btn-lg">
                Começar grátis
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                Já tenho conta
              </Link>
            </div>

            {/* Stats row */}
            <div className="fade-up fade-delay-4" style={{ display: 'flex', gap: 32, borderTop: '1px solid var(--border)', paddingTop: 28 }}>
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="fade-up fade-delay-2" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,211,238,0.06)',
          }}>
            {/* Mockup topbar */}
            <div style={{
              borderBottom: '1px solid var(--border)',
              padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-800)',
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ef4444','#f59e0b','#10b981'].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.9 }} />
                ))}
              </div>
              <div style={{
                flex: 1, margin: '0 8px',
                background: 'var(--bg-700)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 11, color: 'var(--text-muted)',
              }}>
                sitewatch.app/dashboard
              </div>
            </div>

            {/* Mockup content */}
            <div style={{ padding: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Dashboard</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>Status geral</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', color: 'var(--green)', borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>
                    3 Online
                  </div>
                  <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', color: 'var(--red)', borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>
                    1 Offline
                  </div>
                </div>
              </div>

              {/* Site rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DEMO_SITES.map(({ name, uptime, ms, online }) => (
                  <div key={name} style={{
                    background: 'var(--bg-700)',
                    border: `1px solid ${online ? 'var(--border)' : 'var(--red-border)'}`,
                    borderRadius: 'var(--radius)',
                    padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: online ? 'var(--green)' : 'var(--red)',
                      boxShadow: online ? '0 0 6px var(--green)' : 'none',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{uptime} uptime</div>
                    </div>
                    {/* Mini bars */}
                    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 20 }}>
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} style={{
                          width: 3, borderRadius: 2,
                          height: `${online ? Math.max(40, Math.min(100, 60 + Math.sin(i * 1.3) * 35)) : (i < 9 ? Math.max(40, 60 + Math.sin(i * 1.3) * 35) : 20)}%`,
                          background: !online && i >= 9 ? 'var(--red)' : 'var(--green)',
                          opacity: online ? 0.8 : (i >= 9 ? 0.8 : 0.5),
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: online ? 'var(--text-secondary)' : 'var(--red)', minWidth: 32, textAlign: 'right' }}>{ms}</div>
                  </div>
                ))}
              </div>

              {/* Bottom bar */}
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg-800)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Última atualização: agora mesmo</span>
                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Auto-refresh ativo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '80px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="fade-up" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 12 }}>
              Funcionalidades
            </p>
            <h2 className="fade-up fade-delay-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', maxWidth: 500, margin: '0 auto' }}>
              Tudo que você precisa para monitorar sites
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {FEATURES.map(({ icon, title, desc }, i) => (
              <div key={title} className="fade-up card card-hover" style={{ animationDelay: `${i * 0.08}s` }}>
                <div style={{
                  width: 44, height: 44,
                  background: 'var(--accent-glow)',
                  border: '1px solid rgba(34,211,238,0.15)',
                  borderRadius: 'var(--radius)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)',
                  marginBottom: 16,
                }}>
                  {icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.06) 0%, rgba(245,158,11,0.04) 100%)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-2xl)',
            padding: '56px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div aria-hidden style={{
              position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
              width: 400, height: 200,
              background: 'radial-gradient(ellipse, rgba(34,211,238,0.12), transparent 70%)',
              pointerEvents: 'none',
            }} />

            <p className="fade-up" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 16 }}>
              Comece agora
            </p>
            <h2 className="fade-up fade-delay-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 16 }}>
              Monitore de graça. Sem cartão de crédito.
            </h2>
            <p className="fade-up fade-delay-2" style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
              Plano gratuito com até 3 sites monitorados, histórico completo de pings e gráficos de latência.
            </p>
            <div className="fade-up fade-delay-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn btn-primary btn-lg">
                Criar conta grátis
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: 1140, margin: '0 auto',
          padding: '24px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-warm))',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a1420" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>SiteWatch</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Monitoramento de uptime open source · {new Date().getFullYear()}
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/login"    style={{ fontSize: 12, color: 'var(--text-muted)' }}>Entrar</Link>
            <Link href="/register" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cadastro</Link>
            <Link href="/dashboard" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
