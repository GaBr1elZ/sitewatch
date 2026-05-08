'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';

/* ─── Types ──────────────────────────────────── */
type Ping = { id: string; status: number; responseMs: number; isOnline: boolean; checkedAt: string };
type Incident = { id: string; startedAt: string; resolvedAt: string | null; durationMs: number | null };
type Website = {
  id: string; name: string; url: string; active: boolean;
  alertEmail: boolean; webhookUrl: string | null; checkInterval: number;
  pings: Ping[]; incidents: Incident[];
};

/* ─── Helpers ─────────────────────────────────── */
function fmtDate(v: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(v));
}
function fmtDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60)  return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}min ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}min`;
}

/* ─── Icons ───────────────────────────────────── */
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

/* ─── Uptime Bars ────────────────────────────── */
function UptimeBars({ pings }: { pings: Ping[] }) {
  const bars = [...pings].reverse().slice(-60);
  const empty = Array(Math.max(0, 60 - bars.length)).fill(null);
  return (
    <div className="uptime-bars" style={{ height: 36 }} title="Últimas 60 verificações">
      {empty.map((_, i) => <div key={`e${i}`} className="uptime-bar unknown" style={{ height: '40%' }} />)}
      {bars.map((p) => (
        <div key={p.id}
          className={`uptime-bar ${p.isOnline ? 'online' : 'offline'}`}
          style={{ height: `${Math.max(25, Math.min(100, 100 - (p.responseMs / 8)))}%` }}
          title={`${p.isOnline ? 'Online' : 'Offline'} — ${p.responseMs}ms — ${fmtDate(p.checkedAt)}`}
        />
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────── */
export default function SiteDetailPage() {
  const router  = useRouter();
  const params  = useParams<{ id: string }>();
  const siteId  = params.id;
  const { token, user, isLoading, logout } = useAuth();

  const [site,    setSite]    = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Settings form state
  const [formName,      setFormName]      = useState('');
  const [formAlert,     setFormAlert]     = useState(true);
  const [formWebhook,   setFormWebhook]   = useState('');
  const [formInterval,  setFormInterval]  = useState(60);

  useEffect(() => { if (!isLoading && !token) router.replace('/login'); }, [isLoading, token, router]);

  const load = async (quiet = false) => {
    if (!token || !siteId) return;
    if (!quiet) setLoading(true);
    try {
      const res = await api.get<Website>(`/api/websites/${siteId}/detail`);
      setSite(res.data);
      if (!quiet) {
        setFormName(res.data.name);
        setFormAlert(res.data.alertEmail);
        setFormWebhook(res.data.webhookUrl ?? '');
        setFormInterval(res.data.checkInterval);
      }
    } catch (e: unknown) {
      const r = e as { response?: { status?: number } };
      if (r.response?.status === 401) logout();
      else setError('Erro ao carregar site.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    void load();
    
    const socket = io(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');
    
    socket.on('website:updated', (data: { websiteId: string }) => {
      if (data.websiteId === siteId) {
        console.log(`[WS] Detalhes atualizados para o site: ${siteId}`);
        void load(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, siteId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await api.patch<Website>(`/api/websites/${siteId}`, {
        name: formName, alertEmail: formAlert,
        webhookUrl: formWebhook || null, checkInterval: formInterval,
      });
      setSite(prev => prev ? { ...prev, ...res.data } : prev);
      setSuccess('Configurações salvas com sucesso.');
    } catch { setError('Erro ao salvar.'); }
    finally { setSaving(false); }
  };

  if (isLoading || loading) {
    return <div className="loading-screen"><div className="spinner spinner-lg" /><p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</p></div>;
  }
  if (!site) return <div className="loading-screen"><p style={{ color: 'var(--red)' }}>{error || 'Site não encontrado.'}</p></div>;

  const pings    = site.pings;
  const total    = pings.length;
  const online   = pings.filter(p => p.isOnline).length;
  const uptime   = total > 0 ? ((online / total) * 100).toFixed(2) : '100.00';
  const avgMs    = total > 0 ? Math.round(pings.reduce((s, p) => s + p.responseMs, 0) / total) : 0;
  const isOnline = pings[0]?.isOnline;
  const openIncident = site.incidents.find(i => !i.resolvedAt);

  const chartData = [...pings].reverse().slice(-48).map((p, i) => ({
    i, ms: p.isOnline ? p.responseMs : 0, label: fmtDate(p.checkedAt),
  }));

  return (
    <div className="app-shell">
      {/* Sidebar (simplificada) */}
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
          <Link href="/dashboard" className="sidebar-item">
            <IconBack /> Voltar ao Dashboard
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
            <span className={`plan-badge ${user?.plan === 'PRO' ? 'pro' : 'free'}`}>{user?.plan}</span>
          </div>
        </div>
      </aside>

      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <div className="topbar-title">{site.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              <a href={site.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{site.url}</a>
            </div>
          </div>
          <div className="topbar-actions">
            <span className={`badge ${isOnline ? 'badge-online' : (pings.length ? 'badge-offline' : 'badge-unknown')}`}>
              <span className={`status-dot ${isOnline ? 'online' : (pings.length ? 'offline' : 'unknown')}`} />
              {isOnline ? 'Online' : (pings.length ? 'Offline' : 'Sem dados')}
            </span>
          </div>
        </header>

        <main className="page-content">
          {/* Incident alert */}
          {openIncident && (
            <div className="fade-up" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '14px 18px', color: 'var(--red)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Incidente em andamento desde <strong>{fmtDate(openIncident.startedAt)}</strong></span>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Uptime', value: `${uptime}%`, color: parseFloat(uptime) > 99 ? 'var(--green)' : parseFloat(uptime) > 95 ? 'var(--yellow)' : 'var(--red)' },
              { label: 'Resposta média', value: `${avgMs}ms`, color: 'var(--text-primary)' },
              { label: 'Total checks', value: total.toString(), color: 'var(--text-primary)' },
              { label: 'Incidentes', value: site.incidents.length.toString(), color: site.incidents.length > 0 ? 'var(--yellow)' : 'var(--green)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="stat-card" style={{ flexDirection: 'column', gap: 4 }}>
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ fontSize: 28, color }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 1fr' }}>
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Latency chart */}
              <div className="card">
                <div className="section-title">Latência (últimas 48 verificações)</div>
                {chartData.length >= 2 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="i" hide />
                      <Tooltip
                        contentStyle={{ background: '#0c1825', border: '1px solid #1a2d45', borderRadius: 8, fontSize: 11 }}
                        formatter={(v: any) => [`${v}ms`, 'Latência']}
                        labelFormatter={(_, p) => p[0]?.payload?.label ?? ''}
                      />
                      <Area type="monotone" dataKey="ms" stroke="#22d3ee" strokeWidth={2} fill="url(#grad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Dados insuficientes.</p>}
              </div>

              {/* Uptime bars */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="section-title" style={{ margin: 0 }}>Histórico de pings</div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>últimas 60 verificações</span>
                </div>
                <UptimeBars pings={pings} />
              </div>

              {/* Incidents */}
              <div className="card">
                <div className="section-title">Incidentes</div>
                {site.incidents.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhum incidente registrado. 🎉</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {site.incidents.slice(0, 10).map(inc => (
                      <div key={inc.id} style={{
                        background: 'var(--bg-700)', border: `1px solid ${inc.resolvedAt ? 'var(--border)' : 'var(--red-border)'}`,
                        borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: inc.resolvedAt ? 'var(--text-secondary)' : 'var(--red)' }}>
                            {inc.resolvedAt ? '✅ Resolvido' : '🔴 Em andamento'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            Início: {fmtDate(inc.startedAt)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {inc.durationMs && <div style={{ fontSize: 12, color: 'var(--yellow)', fontWeight: 600 }}>{fmtDuration(inc.durationMs)}</div>}
                          {inc.resolvedAt && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Resolvido: {fmtDate(inc.resolvedAt)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column — settings */}
            <div className="card" style={{ alignSelf: 'start' }}>
              <div className="section-title">Configurações</div>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Nome do site</label>
                  <input className="form-input" value={formName} onChange={e => setFormName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">URL</label>
                  <div className="form-input" style={{ cursor: 'not-allowed', opacity: 0.5, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                    <IconGlobe />{site.url}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={formAlert} onChange={e => setFormAlert(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
                    Alertas por email ao cair / voltar
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Webhook URL (Discord / Slack)</label>
                  <input className="form-input" value={formWebhook} onChange={e => setFormWebhook(e.target.value)} placeholder="https://discord.com/api/webhooks/..." />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Deixe em branco para desativar</span>
                </div>

                {user?.plan === 'PRO' && (
                  <div className="form-group">
                    <label className="form-label">Intervalo de verificação</label>
                    <select className="form-input" value={formInterval} onChange={e => setFormInterval(Number(e.target.value))} style={{ cursor: 'pointer' }}>
                      <option value={60}>60 segundos (padrão)</option>
                      <option value={30}>30 segundos (PRO)</option>
                    </select>
                  </div>
                )}

                {error   && <div className="form-error">{error}</div>}
                {success && <div style={{ fontSize: 13, color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>{success}</div>}

                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? <><div className="spinner" />Salvando...</> : <><IconSave />Salvar configurações</>}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
