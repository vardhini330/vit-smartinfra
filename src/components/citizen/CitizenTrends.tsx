import type { Complaint } from '../../types/database';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface Props {
  complaints: Complaint[];
}

interface Point {
  label: string;
  total: number;
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

function buildSeries(complaints: Complaint[]): Point[] {
  const map = new Map<string, Point>();
  complaints.forEach((c) => {
    if (!c.createdAt) return;
    const key = monthKey(c.createdAt);
    if (!key) return;
    let point = map.get(key);
    if (!point) {
      point = { label: monthLabel(key), total: 0 };
      map.set(key, point);
    }
    point.total += 1;
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-6)
    .map(([, v]) => v);
}

export default function CitizenTrends({ complaints }: Props) {
  const data = buildSeries(complaints);
  if (data.length === 0) return null;
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 mb-4">
      <h3 className="font-semibold text-slate-200 mb-3">My complaints over time (last 6 months)</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="label" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1f2937' }} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#22c55e"
              fill="#22c55e33"
              strokeWidth={2}
              name="Complaints"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

