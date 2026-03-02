import type { InfrastructureAsset, Complaint } from '../../types/database';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

interface Props {
  assets: InfrastructureAsset[];
  complaints: Complaint[];
}

interface ComplaintsPoint {
  label: string;
  total: number;
  resolved: number;
  pending: number;
  inProgress: number;
}

interface AssetsPoint {
  label: string;
  good: number;
  moderate: number;
  poor: number;
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map((v) => parseInt(v, 10));
  if (!year || !month) return key;
  return new Date(year, month - 1, 1).toLocaleString(undefined, { month: 'short', year: '2-digit' });
}

function buildComplaintSeries(complaints: Complaint[]): ComplaintsPoint[] {
  const map = new Map<string, ComplaintsPoint>();
  complaints.forEach((c) => {
    if (!c.createdAt) return;
    const key = monthKey(c.createdAt);
    if (!key) return;
    let point = map.get(key);
    if (!point) {
      point = { label: monthLabel(key), total: 0, resolved: 0, pending: 0, inProgress: 0 };
      map.set(key, point);
    }
    point.total += 1;
    if (c.status === 'Resolved') point.resolved += 1;
    else if (c.status === 'Pending') point.pending += 1;
    else point.inProgress += 1;
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-6)
    .map(([, v]) => v);
}

function buildAssetSeries(assets: InfrastructureAsset[]): AssetsPoint[] {
  const map = new Map<string, AssetsPoint>();
  assets.forEach((a) => {
    if (!a.createdAt) return;
    const key = monthKey(a.createdAt);
    if (!key) return;
    let point = map.get(key);
    if (!point) {
      point = { label: monthLabel(key), good: 0, moderate: 0, poor: 0 };
      map.set(key, point);
    }
    if (a.condition === 'Good') point.good += 1;
    else if (a.condition === 'Moderate') point.moderate += 1;
    else point.poor += 1;
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-6)
    .map(([, v]) => v);
}

export default function TrendCharts({ assets, complaints }: Props) {
  const complaintData = buildComplaintSeries(complaints);
  const assetData = buildAssetSeries(assets);

  if (complaintData.length === 0 && assetData.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {complaintData.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
          <h3 className="font-semibold text-slate-200 mb-3">Complaints over time (last 6 months)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complaintData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1f2937' }} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
                <Line type="monotone" dataKey="pending" stroke="#f97316" strokeWidth={2} name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {assetData.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
          <h3 className="font-semibold text-slate-200 mb-3">Assets by condition over time (created)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetData} stackOffset="none">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1f2937' }} />
                <Legend />
                <Bar dataKey="good" stackId="a" fill="#22c55e" name="Good" />
                <Bar dataKey="moderate" stackId="a" fill="#f59e0b" name="Moderate" />
                <Bar dataKey="poor" stackId="a" fill="#ef4444" name="Poor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

