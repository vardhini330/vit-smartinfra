import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import type { InfrastructureAsset, Complaint } from '../../types/database';
import Chart from 'chart.js/auto';
import type { DashboardAnalytics } from '../../types/database';
import { Building2, LogOut, MapPin, MessageSquare, PlusCircle } from 'lucide-react';
import CitizenAssetList from './CitizenAssetList';
import CitizenComplaints from './CitizenComplaints';
import RaiseComplaint from './RaiseComplaint';
import AssetMap from '../shared/AssetMap';
import ExportButtons from '../shared/ExportButtons';

const REFRESH_MS = 20000;

export default function CitizenDashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<'assets' | 'complaints' | 'raise'>('assets');
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [allAssets, setAllAssets] = useState<InfrastructureAsset[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<any>(null);
  const [zoneFilter, setZoneFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const load = async () => {
    try {
      const [filtered, all, c, a] = await Promise.all([
        api.assets.list({ ...(zoneFilter && { zone: zoneFilter }), ...(typeFilter && { type: typeFilter }) }),
        api.assets.list(),
        api.complaints.list(),
        api.analytics.dashboard(),
      ]);
      setAssets(filtered);
      setAllAssets(all);
      setComplaints(c);
      setAnalytics(a);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [zoneFilter, typeFilter]);

  useEffect(() => {
    if (!analytics || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const total = analytics.assetsByCondition.Good + analytics.assetsByCondition.Moderate + analytics.assetsByCondition.Poor;
    const tooltipCallback = function (context: any) {
      const value = context.parsed || 0;
      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
      return `${value} (${percent}%)`;
    };

    if (!chartRef.current) {
      chartRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Good', 'Moderate', 'Poor'],
          datasets: [{ data: [analytics.assetsByCondition.Good, analytics.assetsByCondition.Moderate, analytics.assetsByCondition.Poor], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], hoverOffset: 6 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: '#cbd5e1' } }, tooltip: { callbacks: { label: tooltipCallback } } },
          layout: { padding: 6 },
        },
      });
    } else {
      chartRef.current.data.datasets[0].data = [analytics.assetsByCondition.Good, analytics.assetsByCondition.Moderate, analytics.assetsByCondition.Poor];
      chartRef.current.update();
    }
  }, [analytics]);

  const onComplaintRaised = () => {
    load();
    setTab('complaints');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-emerald-500" />
            <span className="font-bold text-lg">SmartInfra</span>
            <span className="text-slate-500 text-sm">Citizen</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ExportButtons
              assets={allAssets}
              complaints={complaints}
              variant="citizen"
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
            { id: 'assets', label: 'Infrastructure', icon: MapPin },
            { id: 'complaints', label: 'My Complaints', icon: MessageSquare },
            { id: 'raise', label: 'Raise Complaint', icon: PlusCircle },
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
        {tab === 'assets' && (
          <div className="space-y-4">
            {analytics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Total Assets</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">{analytics.totalAssets}</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Total Complaints</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">{analytics.totalComplaints}</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">City Health Index</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">{analytics.cityHealthIndex}%</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-20 h-20">
                    <canvas ref={canvasRef} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Assets by Condition</p>
                    <p className="text-sm text-slate-300">Good: {analytics.assetsByCondition.Good}</p>
                    <p className="text-sm text-slate-300">Moderate: {analytics.assetsByCondition.Moderate}</p>
                    <p className="text-sm text-slate-300">Poor: {analytics.assetsByCondition.Poor}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
              <h3 className="font-medium text-slate-200 mb-3">Map View</h3>
              <AssetMap assets={assets} height="320px" />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <h2 className="text-xl font-semibold">Infrastructure Assets</h2>
              <input
                type="text"
                placeholder="Filter by zone"
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 text-sm"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm"
              >
                <option value="">All types</option>
                <option value="Road">Road</option>
                <option value="Bridge">Bridge</option>
                <option value="Streetlight">Streetlight</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Hospital">Hospital</option>
              </select>
            </div>
            <CitizenAssetList assets={assets} />
          </div>
        )}

        {tab === 'complaints' && <CitizenComplaints complaints={complaints} onUpdate={load} />}

        {tab === 'raise' && <RaiseComplaint assets={allAssets} onSuccess={onComplaintRaised} />}
      </main>
    </div>
  );
}
