'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Ping     = { id: string; isOnline: boolean; responseMs: number; checkedAt: string };
type Incident = { id: string; startedAt: string; resolvedAt: string | null; durationMs: number | null };
type Site = {
  id: string; name: string; url: string;
  isOnline: boolean | null; uptime: number; avgMs: number; totalChecks: number;
  pings: Ping[]; incidents: Incident[];
};
type StatusData = { owner: string; slug: string; sites: Site[] };

function fmtDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60)  return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}min`;
}

function UptimeBars({ pings }: { pings: Ping[] }) {
  const bars  = [...pings].reverse().slice(-60);
  const empty = Array(Math.max(0, 60 - bars.length)).fill(null);
  return (
    <div className="uptime-bars" style={{ height: 28 }}>
      {empty.map((_, i) => <div key={`e${i}`} className="uptime-bar unknown" style={{ height: '40%' }} />)}
      {bars.map((p) => (
        <div key={p.id}
          className={`uptime-bar ${p.isOnline ? 'online' : 'offline'}`}
          style={{ height: `${Math.max(25, Math.min(100, 100 - (p.responseMs / 8)))}%` }}
        />
      ))}
    </div>
  );
}

export default function StatusPage() {
  const params = useParams<{ slug: string }>();
  const slug   = params.slug;
  const [data,    setData]    = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch(`${API}/api/status/${slug}`)
      .then(r => r.ok ? r.json() as Promise<StatusData> : Promise.reject(r.status))
      .then(setData)
      .catch(() => setError('Página de status não encontrada.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div className="spinner spinner-lg" />
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Carregando status...</p>
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{error}</p>
    </div>
  );

  const allOnline  = data.sites.every(s => s.isOnline === true);
  const anyOffline = data.sites.some(s => s.isOnline === false);
  const globalStatus = anyOffline ? 'Alguns sistemas com problemas' : allOnline ? 'Todos os sistemas operacionais' : 'Verificando...';
  const globalColor  = anyOffline ? 'var(--red)' : 'var(--green)';

  return (
    <div style={{ background: 'var(--bg-900)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div className="hero-orb" style={{ top: '-120px', left: '-80px' }} />
        <div className="grain" />
      </div>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(6,13,22,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg, var(--accent), var(--accent-warm))', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a1420" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Status de <span style={{ color: 'var(--accent)' }}>{data.owner}</span>
            </span>
          </div>
          <Link href="/register" className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
            Monitorar meus sites
          </Link>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

        {/* Global status banner */}
        <div className="fade-up" style={{
          textAlign: 'center', marginBottom: 48,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: anyOffline ? 'var(--red-bg)' : 'var(--green-bg)',
            border: `1px solid ${anyOffline ? 'var(--red-border)' : 'var(--green-border)'}`,
            borderRadius: 999, padding: '10px 24px',
            marginBottom: 16,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: globalColor, boxShadow: `0 0 8px ${globalColor}` }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: globalColor }}>{globalStatus}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Última atualização: {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date())}
          </p>
        </div>

        {/* Sites */}
        <div className="fade-up fade-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.sites.map((site, idx) => (
            <div key={site.id} className="card" style={{ animationDelay: `${idx * 0.06}s` }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: site.isOnline === null ? 'var(--text-muted)' : site.isOnline ? 'var(--green)' : 'var(--red)',
                  boxShadow: site.isOnline ? '0 0 8px var(--green)' : 'none',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{site.name}</div>
                  <a href={site.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{site.url}</a>
                </div>
                <div style={{ display: 'flex', gap: 16, textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: site.uptime >= 99 ? 'var(--green)' : site.uptime >= 95 ? 'var(--yellow)' : 'var(--red)' }}>{site.uptime.toFixed(2)}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Uptime</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{site.avgMs}ms</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Resp. média</div>
                  </div>
                </div>
              </div>

              {/* Uptime bars */}
              <UptimeBars pings={site.pings} />

              {/* Open incident */}
              {site.incidents.find(i => !i.resolvedAt) && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--red)', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                  ⚠️ Incidente em andamento desde {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(site.incidents.find(i => !i.resolvedAt)!.startedAt))}
                </div>
              )}

              {/* Recent resolved incidents */}
              {site.incidents.filter(i => i.resolvedAt).slice(0, 2).map(inc => (
                <div key={inc.id} style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Incidente em {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(inc.startedAt))}</span>
                  {inc.durationMs && <span style={{ color: 'var(--yellow)' }}>{fmtDuration(inc.durationMs)}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Monitorado por</p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <div style={{ width: 20, height: 20, background: 'linear-gradient(135deg, var(--accent), var(--accent-warm))', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a1420" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>SiteWatch</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
