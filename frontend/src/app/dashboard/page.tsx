'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

/* ─── Types ─────────────────────────────────────────── */
type Ping = {
  id: string;
  status: number;
  responseMs: number;
  isOnline: boolean;
  checkedAt: string;
};

type Incident = {
  id: string;
  startedAt: string;
  resolvedAt: string | null;
  durationMs: number | null;
};

type Website = {
  id: string;
  name: string;
  url: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  pings: Ping[];
  incidents: Incident[];
};

type WebsiteStats = {
  uptimePercentage: number;
  avgResponseMs: number;
  totalChecks: number;
  onlineChecks: number;
};

/* ─── Helpers ────────────────────────────────────────── */
function getHost(value: string) {
  try { return new URL(value).hostname; } catch { return value; }
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ─── Icons ──────────────────────────────────────────── */
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IconActivity = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const IconWarning = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

/* ─── Uptime Bars ─────────────────────────────────────── */
function UptimeBars({ pings }: { pings: Ping[] }) {
  const bars = [...pings].reverse().slice(-30);
  const empty = Array(Math.max(0, 30 - bars.length)).fill(null);
  return (
    <div className="uptime-bars" title="Últimas 30 verificações">
      {empty.map((_, i) => <div key={`e-${i}`} className="uptime-bar unknown" style={{ height: '40%' }} />)}
      {bars.map((p) => (
        <div
          key={p.id}
          className={`uptime-bar ${p.isOnline ? 'online' : 'offline'}`}
          style={{ height: `${Math.max(25, Math.min(100, 100 - (p.responseMs / 8)))}%` }}
          title={`${p.isOnline ? 'Online' : 'Offline'} — ${p.responseMs}ms`}
        />
      ))}
    </div>
  );
}

/* ─── Latency Chart ───────────────────────────────────── */
function LatencyChart({ pings }: { pings: Ping[] }) {
  const data = [...pings].reverse().slice(-20).map((p, i) => ({
    i,
    ms: p.isOnline ? p.responseMs : 0,
  }));
  if (data.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{ background: '#0c1825', border: '1px solid #1a2d45', borderRadius: 8, fontSize: 11 }}
          formatter={(v: number) => [`${v}ms`, 'Latência']}
          labelFormatter={() => ''}
        />
        <Area type="monotone" dataKey="ms" stroke="#22d3ee" strokeWidth={1.5} fill="url(#lg)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── Add Website Modal ───────────────────────────────── */
function AddWebsiteModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const { logout } = useAuth();
  const [name, setName] = useState('');
  const [url, setUrl]   = useState('');
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api.post('/api/websites', { name, url });
      onAdded();
      onClose();
    } catch (cause: unknown) {
      const r = cause as { response?: { data?: { error?: string }; status?: number }; message?: string };
      if (r.response?.status === 401) { logout(); return; }
      setErr(r.response?.data?.error ?? r.message ?? 'Erro ao cadastrar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-up">
        <div className="modal-header">
          <h2 className="modal-title">Adicionar website</h2>
          <button className="modal-close" onClick={onClose} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)}
              placeholder="Meu Site" required />
          </div>
          <div className="form-group">
            <label className="form-label">URL</label>
            <input className="form-input" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://meusite.com" required />
          </div>

          {err && <div className="form-error"><IconWarning />{err}</div>}

          <div className="modal-footer" style={{ marginTop: 8 }}>
            <button className="btn btn-secondary" type="button" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? <><div className="spinner" />Salvando...</> : <><IconPlus />Cadastrar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Website Card ────────────────────────────────────── */
function WebsiteCard({ website, statsMap, onDelete }: {
  website: Website;
  statsMap: Record<string, WebsiteStats>;
  onDelete: (id: string) => void;
}) {
  const latest = website.pings[0];
  const stats  = statsMap[website.id];
  const online = latest?.isOnline;

  return (
    <article className="website-card fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        {/* Left */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{website.name}</h3>
            <span className={`badge ${online ? 'badge-online' : (latest ? 'badge-offline' : 'badge-unknown')}`}>
              <span className={`status-dot ${online ? 'online' : (latest ? 'offline' : 'unknown')}`} />
              {online ? 'Online' : (latest ? 'Offline' : 'Sem dados')}
            </span>
          </div>
          <a
            href={website.url} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}
          >
            {getHost(website.url)}
          </a>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Link
            href={`/dashboard/${website.id}`}
            className="btn btn-ghost btn-sm"
            title="Ver detalhes"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1"/>
            </svg>
            Detalhes
          </Link>
          <button
            className="btn btn-danger btn-sm"
            type="button"
            onClick={() => onDelete(website.id)}
            title="Remover"
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
        {[
          ['Uptime', `${stats ? stats.uptimePercentage.toFixed(2) : '100.00'}%`],
          ['Avg resp.', `${stats ? stats.avgResponseMs : (latest?.responseMs ?? 0)}ms`],
          ['Checks', `${stats ? stats.totalChecks : website.pings.length}`],
        ].map(([label, value]) => (
          <div key={label} style={{
            background: 'var(--bg-700)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '10px 12px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>{label}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-display)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Latency chart */}
      {website.pings.length >= 2 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 }}>Latência (últimas verificações)</div>
          <LatencyChart pings={website.pings} />
        </div>
      )}

      {/* Uptime bars */}
      {website.pings.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Histórico de pings</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>últimas 30 verificações</span>
          </div>
          <UptimeBars pings={website.pings} />
        </div>
      )}

      {/* Active incident warning */}
      {website.incidents?.find(i => !i.resolvedAt) && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--red)', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Incidente em andamento
        </div>
      )}
    </article>
  );
}

/* ─── Main Page ───────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth();
  const [websites, setWebsites]           = useState<Website[]>([]);
  const [loadingData, setLoadingData]     = useState(true);
  const [error, setError]                 = useState('');
  const [stats, setStats]                 = useState<Record<string, WebsiteStats>>({});
  const [showModal, setShowModal]         = useState(false);
  const [refreshing, setRefreshing]       = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const FREE_LIMIT = 3;
  const isAtLimit  = user?.plan === 'FREE' && websites.length >= FREE_LIMIT;

  const summary = useMemo(() => {
    const total   = websites.length;
    const online  = websites.filter(w => w.pings[0]?.isOnline).length;
    const avgResp = total === 0 ? 0 : Math.round(
      websites.reduce((acc, w) => acc + (w.pings[0]?.responseMs ?? 0), 0) / total
    );
    const avgUptime = total === 0 ? 100 : (
      Object.values(stats).reduce((acc, s) => acc + s.uptimePercentage, 0) / total
    );
    return { total, online, avgResp, avgUptime };
  }, [websites, stats]);

  /* auth guard */
  useEffect(() => {
    if (!isLoading && !token) router.replace('/login');
  }, [isLoading, router, token]);

  /* load data */
  const loadData = async (quiet = false) => {
    if (!token) return;
    if (!quiet) setLoadingData(true);
    else setRefreshing(true);
    setError('');

    try {
      const res  = await api.get<Website[]>('/api/websites');
      const data = res.data;
      setWebsites(data);

      const pairs = await Promise.all(
        data.map(async (w) => {
          try {
            const sr = await api.get<{ stats: WebsiteStats }>(`/api/websites/${w.id}/stats`);
            return [w.id, sr.data.stats] as const;
          } catch {
            const total   = w.pings.length;
            const online  = w.pings.filter(p => p.isOnline).length;
            const avgMs   = total > 0 ? Math.round(w.pings.reduce((s, p) => s + p.responseMs, 0) / total) : 0;
            return [w.id, { uptimePercentage: total > 0 ? (online / total) * 100 : 100, avgResponseMs: avgMs, totalChecks: total, onlineChecks: online }] as const;
          }
        })
      );
      setStats(Object.fromEntries(pairs));
    } catch (e: unknown) {
      const r = e as { response?: { status?: number }; message?: string };
      if (r.response?.status === 401) { logout(); return; }
      setError(r.message ?? 'Falha ao carregar dados.');
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
    intervalRef.current = setInterval(() => void loadData(true), 60_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/websites/${id}`);
      setWebsites(cur => cur.filter(w => w.id !== id));
    } catch (e: unknown) {
      const r = e as { response?: { data?: { error?: string }; status?: number }; message?: string };
      if (r.response?.status === 401) { logout(); return; }
      setError(r.response?.data?.error ?? r.message ?? 'Erro ao remover.');
    }
  };

  /* Loading screen */
  if (isLoading || (!token && !user)) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Verificando sessão…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <Link href="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a1420" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="sidebar-logo-text">SiteWatch</span>
        </Link>

        <nav className="sidebar-nav">
          <span className="sidebar-label">Monitoramento</span>
          <a className="sidebar-item active" href="/dashboard">
            <IconGlobe />
            Websites
          </a>
          <a className="sidebar-item" href="/dashboard" style={{ opacity: 0.45, cursor: 'not-allowed' }}>
            <IconActivity />
            Incidentes
            <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 6px', background: 'var(--bg-600)', borderRadius: 999, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Em breve</span>
          </a>

          <span className="sidebar-label">Conta</span>
          <Link href="/" className="sidebar-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Início
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials(user?.name ?? 'U')}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
            <span className={`plan-badge ${user?.plan === 'PRO' ? 'pro' : 'free'}`}>{user?.plan}</span>
          </div>
          <button
            className="sidebar-item"
            style={{ marginTop: 6, width: '100%', color: 'var(--red)' }}
            onClick={logout}
            type="button"
          >
            <IconLogout />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <div className="topbar-title">Dashboard</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              Olá, <strong style={{ color: 'var(--text-secondary)' }}>{user?.name?.split(' ')[0]}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            {isAtLimit && (
              <div className="limit-banner">
                <IconWarning />
                Limite FREE atingido ({FREE_LIMIT}/{FREE_LIMIT})
              </div>
            )}
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => void loadData(true)}
              disabled={refreshing}
              title="Atualizar"
              style={{ gap: 6 }}
            >
              <span style={{ display: 'flex', animation: refreshing ? 'spin 0.6s linear infinite' : 'none' }}>
                <IconRefresh />
              </span>
              {refreshing ? 'Atualizando…' : 'Atualizar'}
            </button>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => !isAtLimit && setShowModal(true)}
              disabled={isAtLimit}
              title={isAtLimit ? `Limite de ${FREE_LIMIT} sites atingido no plano FREE` : 'Adicionar website'}
            >
              <IconPlus />
              Novo site
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="page-content">
          {/* Error */}
          {error && (
            <div className="form-error fade-up" style={{ marginBottom: 24 }}>
              <IconWarning />{error}
            </div>
          )}


          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
            <div className="stat-card fade-up">
              <div className="stat-icon cyan"><IconGlobe /></div>
              <div className="stat-body">
                <div className="stat-label">Sites</div>
                <div className="stat-value">{summary.total}</div>
                <div className="stat-sub">{user?.plan === 'FREE' ? `${summary.total}/${FREE_LIMIT} gratuitos` : 'Ilimitados'}</div>
              </div>
            </div>
            <div className="stat-card fade-up" style={{ animationDelay: '0.08s' }}>
              <div className="stat-icon green"><IconCheck /></div>
              <div className="stat-body">
                <div className="stat-label">Online</div>
                <div className="stat-value">{summary.online}</div>
                <div className="stat-sub">{summary.total > 0 ? `${summary.total - summary.online} offline` : '—'}</div>
              </div>
            </div>
            <div className="stat-card fade-up" style={{ animationDelay: '0.16s' }}>
              <div className="stat-icon cyan"><IconClock /></div>
              <div className="stat-body">
                <div className="stat-label">Latência média</div>
                <div className="stat-value">{summary.avgResp}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>ms</span></div>
                <div className="stat-sub">última verificação</div>
              </div>
            </div>
            <div className="stat-card fade-up" style={{ animationDelay: '0.24s' }}>
              <div className="stat-icon green"><IconActivity /></div>
              <div className="stat-body">
                <div className="stat-label">Uptime geral</div>
                <div className="stat-value">{summary.avgUptime.toFixed(1)}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>%</span></div>
                <div className="stat-sub">média de todos os sites</div>
              </div>
            </div>
          </div>

          {/* Website list */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="section-title" style={{ margin: 0 }}>Seus websites</span>
            {loadingData && <div className="spinner" />}
          </div>

          {!loadingData && websites.length === 0 ? (
            <div className="empty-state fade-up">
              <div className="empty-state-icon"><IconGlobe /></div>
              <h3>Nenhum site monitorado</h3>
              <p>Adicione sua primeira URL e o SiteWatch começa a monitorar imediatamente.</p>
              <button className="btn btn-primary" type="button" onClick={() => setShowModal(true)}>
                <IconPlus />Adicionar website
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
              {websites.map(w => (
                <WebsiteCard
                  key={w.id}
                  website={w}
                  statsMap={stats}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <AddWebsiteModal
          onClose={() => setShowModal(false)}
          onAdded={() => void loadData()}
        />
      )}
    </div>
  );
}