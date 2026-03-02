import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import type { DashboardAnalytics, InfrastructureAsset, Complaint, AuditLog } from '../../types/database';
import { Building2, LogOut, LayoutDashboard, MapPin, MessageSquare, FileText, Bell, Wrench } from 'lucide-react';
import AssetList from './AssetList';
import Chart from 'chart.js/auto';
import ExportButtons from '../shared/ExportButtons';
import AssetForm from './AssetForm';
import ComplaintManagement from './ComplaintManagement';
import AuditLogPanel from './AuditLogPanel';
import AssetMap from '../shared/AssetMap';

const REFRESH_MS = 15000;

export default function OfficialDashboard() {
  const { user, signOut } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [tab, setTab] = useState<'overview' | 'assets' | 'complaints' | 'audit' | 'admin'>('overview');
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const load = async () => {
    try {
      const [a, ast, comp, logs] = await Promise.all([
        api.analytics.dashboard(),
        api.assets.list(),
        api.complaints.list(),
        api.audit.list(20),
      ]);
      setAnalytics(a);
      setAssets(ast);
      setComplaints(comp);
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const onAssetChange = () => {
    load();
  };

  const onComplaintChange = () => {
    load();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-emerald-500" />
            <span className="font-bold text-lg">SmartInfra</span>
            <span className="text-slate-500 text-sm">
              {user?.role === 'superadmin' ? 'Super Admin' : 'Official'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ExportButtons
              assets={assets}
              complaints={complaints}
              analytics={analytics}
              variant="official"
            />
            <span className="text-slate-400 text-sm">{user?.fullName}</span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-sm"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 border-t border-slate-800/50">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'assets', label: 'Assets', icon: MapPin },
            { id: 'complaints', label: 'Complaints', icon: MessageSquare },
            { id: 'audit', label: 'Audit Log', icon: FileText },
            ...(user?.role === 'superadmin'
              ? [{ id: 'admin', label: 'Create Official', icon: Wrench }]
              : []),
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as typeof tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                tab === id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === 'overview' && analytics && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-400 mb-4">
              <Bell className="w-5 h-5" />
              <span className="font-medium">Notifications</span>
              {analytics.pendingComplaints > 0 && (
                <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-sm">
                  {analytics.pendingComplaints} pending complaint(s)
                </span>
              )}
              {analytics.highPriorityAssetCount > 0 && (
                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-sm">
                  {analytics.highPriorityAssetCount} high priority asset(s)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Assets" value={analytics.totalAssets} />
              <StatCard title="Total Complaints" value={analytics.totalComplaints} />
              <StatCard title="High Priority Assets" value={analytics.highPriorityAssetCount} />
              <StatCard title="City Health Index" value={`${analytics.cityHealthIndex}%`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-slate-200 mb-4">Assets by Condition</h3>
                <ConditionPieChart data={analytics.assetsByCondition} />
              </div>
              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-slate-200 mb-4">Latest Audit Logs</h3>
                <AuditLogPanel logs={auditLogs.slice(0, 8)} compact />
              </div>
            </div>
          </div>
        )}

        {tab === 'assets' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Infrastructure Assets</h2>
              <AssetForm onSuccess={onAssetChange} />
            </div>
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
              <h3 className="font-medium text-slate-200 mb-3">Map View</h3>
              <AssetMap assets={assets} height="350px" />
            </div>
            <AssetList assets={assets} onUpdate={onAssetChange} />
          </div>
        )}

        {tab === 'complaints' && (
          <ComplaintManagement complaints={complaints} onUpdate={onComplaintChange} />
        )}

        {tab === 'audit' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Audit Log</h2>
            <AuditLogPanel logs={auditLogs} />
          </div>
        )}

        {tab === 'admin' && user?.role === 'superadmin' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5" /> Create Official Account
            </h2>
            <CreateOfficialForm />
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
    </div>
  );
}

function ConditionPieChart({ data }: { data: { Good: number; Moderate: number; Poor: number } }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const total = data.Good + data.Moderate + data.Poor;
    const tooltipCallback = function (context: any) {
      const value = context.parsed || 0;
      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
      return `${value} (${percent}%)`;
    };

    if (!chartRef.current) {
      chartRef.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Good', 'Moderate', 'Poor'],
          datasets: [
            {
              data: [data.Good, data.Moderate, data.Poor],
              backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#cbd5e1' } },
            tooltip: { callbacks: { label: tooltipCallback } },
          },
          layout: { padding: 8 },
        },
      });
    } else {
      chartRef.current.data.datasets[0].data = [data.Good, data.Moderate, data.Poor];
      chartRef.current.update();
    }
  }, [data.Good, data.Moderate, data.Poor]);

  return (
    <div className="flex items-center gap-6">
      <div className="w-56 h-56" style={{ minWidth: 220, minHeight: 220 }}>
        <canvas ref={canvasRef} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> Good: {data.Good}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> Moderate: {data.Moderate}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" /> Poor: {data.Poor}
        </div>
      </div>
    </div>
  );
}

function CreateOfficialForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.admin.createOfficial(email, password, fullName);
      setSuccess('Official account created. They can sign in with this email and password.');
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create official');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 max-w-lg">
      <p className="text-slate-400 text-sm mb-4">
        Create a new official account. They will have access to infrastructure management, complaints, and audit. Only super admins can use this.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
            {success}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g. Infrastructure Admin"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g. official@city.gov"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password (min 6)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="••••••••"
            minLength={6}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create official'}
        </button>
      </form>
    </div>
  );
}
