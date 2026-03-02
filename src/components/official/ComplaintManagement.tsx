import React, { useState } from 'react';
import { api } from '../../lib/api';
import type { Complaint, ComplaintStatus } from '../../types/database';
import { RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

const STATUSES: ComplaintStatus[] = ['Pending', 'In Progress', 'Resolved'];
const UPLOADS_BASE = (import.meta.env.VITE_API_URL || '/api').replace('/api', '') || '';

function getUploadUrl(path: string) {
  if (path.startsWith('http')) return path;
  return `${UPLOADS_BASE}${path}`;
}

interface Props {
  complaints: Complaint[];
  onUpdate: () => void;
}

export default function ComplaintManagement({ complaints, onUpdate }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = statusFilter
    ? complaints.filter((c) => c.status === statusFilter)
    : complaints;

  const updateStatus = async (id: string, status: ComplaintStatus) => {
    setUpdating(id);
    try {
      await api.complaints.updateStatus(id, status);
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const assetInfo = (c: Complaint) => {
    const a = c.assetId;
    if (typeof a === 'object' && a !== null && 'assetId' in a) return `${a.assetId} - ${a.type} (${a.zone})`;
    return String(a);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-xl font-semibold">Complaints</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={onUpdate}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-slate-500">No complaints match the filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/50">
                  <th className="px-4 py-3 text-slate-400 font-medium w-8"></th>
                  <th className="px-4 py-3 text-slate-400 font-medium">ID</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Asset</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Citizen</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Description</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <React.Fragment key={c._id}>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpanded(expanded === c._id ? null : c._id)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          {expanded === c._id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300 text-sm">{c.complaintId}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{assetInfo(c)}</td>
                    <td className="px-4 py-3 text-slate-300">{c.citizenName}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{c.description}</td>
                    <td className="px-4 py-3">
                      <span className={
                        c.status === 'Resolved' ? 'text-emerald-400' :
                        c.status === 'In Progress' ? 'text-amber-400' : 'text-slate-400'
                      }>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.status !== 'Resolved' && (
                        <div className="flex gap-1 flex-wrap">
                          {STATUSES.filter((s) => s !== c.status).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(c._id, s)}
                              disabled={updating === c._id}
                              className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 disabled:opacity-50"
                            >
                              → {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                  {expanded === c._id && (
                    <tr className="border-b border-slate-700/50 bg-slate-800/50">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="space-y-2 text-sm">
                          <p className="text-slate-300">{c.description}</p>
                          {(c.photos?.length || c.voiceNoteUrl) && (
                            <div className="flex flex-wrap gap-3">
                              {c.photos?.map((url, i) => (
                                <a key={i} href={getUploadUrl(url)} target="_blank" rel="noopener noreferrer">
                                  <img src={getUploadUrl(url)} alt="" className="h-16 w-16 object-cover rounded border border-slate-600" />
                                </a>
                              ))}
                              {c.voiceNoteUrl && (
                                <audio src={getUploadUrl(c.voiceNoteUrl)} controls className="h-8" />
                              )}
                            </div>
                          )}
                          {c.feedback?.submittedAt && (
                            <p className="text-slate-400">Feedback: {c.feedback.rating}/5 {c.feedback.comment && `— ${c.feedback.comment}`}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
