import { useState } from 'react';
import { api } from '../../lib/api';
import type { InfrastructureAsset, Condition, AssetStatus } from '../../types/database';
import { Pencil, Trash2 } from 'lucide-react';

const CONDITIONS: Condition[] = ['Good', 'Moderate', 'Poor'];
const STATUSES: AssetStatus[] = ['Active', 'Under Maintenance', 'Closed'];

interface Props {
  assets: InfrastructureAsset[];
  onUpdate: () => void;
}

export default function AssetList({ assets, onUpdate }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [condition, setCondition] = useState<Condition>('Good');
  const [status, setStatus] = useState<AssetStatus>('Active');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const startEdit = (a: InfrastructureAsset) => {
    setEditing(a.assetId);
    setCondition(a.condition);
    setStatus(a.status);
    setMaintenanceDate(a.lastMaintenanceDate ? a.lastMaintenanceDate.slice(0, 10) : '');
    setLatitude(a.latitude != null ? String(a.latitude) : '');
    setLongitude(a.longitude != null ? String(a.longitude) : '');
  };

  const saveEdit = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const latNum = latitude.trim() ? Number(latitude) : NaN;
      const lngNum = longitude.trim() ? Number(longitude) : NaN;
      await api.assets.update(editing, {
        condition,
        status,
        lastMaintenanceDate: maintenanceDate || undefined,
        latitude: Number.isFinite(latNum) ? latNum : undefined,
        longitude: Number.isFinite(lngNum) ? lngNum : undefined,
      });
      setEditing(null);
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async (assetId: string) => {
    if (!confirm('Delete this asset?')) return;
    try {
      await api.assets.delete(assetId);
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const priorityColor = (level: string) =>
    level === 'High' ? 'text-red-400' : level === 'Medium' ? 'text-amber-400' : 'text-slate-400';

  if (assets.length === 0) {
    return <p className="text-slate-500 py-8">No assets yet. Add one using the button above.</p>;
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th className="px-4 py-3 text-slate-400 font-medium">Asset ID</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Type</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Location</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Zone</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Condition</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Priority</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Complaints</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr
                key={a._id}
                className="border-b border-slate-700/50 hover:bg-slate-800/30"
              >
                <td className="px-4 py-3 text-slate-200 font-mono text-sm">{a.assetId}</td>
                <td className="px-4 py-3 text-slate-300">{a.type}</td>
                <td className="px-4 py-3 text-slate-300">{a.location}</td>
                <td className="px-4 py-3 text-slate-300">{a.zone}</td>
                <td className="px-4 py-3">
                  {editing === a.assetId ? (
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as Condition)}
                      className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm"
                    >
                      {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <span className={a.condition === 'Good' ? 'text-emerald-400' : a.condition === 'Moderate' ? 'text-amber-400' : 'text-red-400'}>
                      {a.condition}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === a.assetId ? (
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as AssetStatus)}
                      className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className="text-slate-300">{a.status}</span>
                  )}
                </td>
                <td className={`px-4 py-3 font-medium ${priorityColor(a.priorityLevel)}`}>{a.priorityLevel}</td>
                <td className="px-4 py-3 text-slate-400">{a.complaintCount}</td>
                <td className="px-4 py-3">
                  {editing === a.assetId ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        value={maintenanceDate}
                        onChange={(e) => setMaintenanceDate(e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Lat"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm w-20"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Lng"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm w-20"
                      />
                      <button onClick={saveEdit} disabled={loading} className="text-emerald-400 hover:underline text-sm">Save</button>
                      <button onClick={() => setEditing(null)} className="text-slate-400 hover:underline text-sm">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(a)} className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-slate-200">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteAsset(a.assetId)} className="p-1.5 rounded text-slate-400 hover:bg-red-500/20 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
