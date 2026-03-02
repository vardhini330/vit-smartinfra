import type { AuditLog } from '../../types/database';
import { FileText } from 'lucide-react';

interface Props {
  logs: AuditLog[];
  compact?: boolean;
}

export default function AuditLogPanel({ logs, compact }: Props) {
  if (logs.length === 0) {
    return <p className="text-slate-500 py-4">No audit logs yet.</p>;
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {logs.map((log) => (
        <div
          key={log._id}
          className={`flex gap-3 rounded-lg border border-slate-700/50 bg-slate-800/30 ${compact ? 'px-3 py-2 text-sm' : 'p-3'}`}
        >
          <FileText className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-slate-200">{log.action}</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {log.performedBy} · {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
