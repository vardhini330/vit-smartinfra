import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    fetchAlerts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, unreadOnly]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        unreadOnly: unreadOnly.toString()
      });

      const response = await fetch(`/api/alerts?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
      }
    } catch (error) {
      // Fallback when notifications util isn't available
      // eslint-disable-next-line no-console
      console.error('Failed to fetch alerts', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/alerts/${alertId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAlerts();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to mark alert as read', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-900/30 border-red-500 text-red-400';
      case 'Medium': return 'bg-amber-900/30 border-amber-500 text-amber-400';
      case 'Low': return 'bg-blue-900/30 border-blue-500 text-blue-400';
      default: return 'bg-slate-900/30 border-slate-500 text-slate-400';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'High Priority Asset':
        return <AlertTriangle className="w-5 h-5" />;
      case 'Pending Complaints':
        return <AlertCircle className="w-5 h-5" />;
      case 'Overdue Maintenance':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  if (loading) return <div className="py-8 text-center text-slate-400">Loading alerts…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-emerald-500" />
          Alerts
        </h2>
        <button
          onClick={() => { setUnreadOnly(!unreadOnly); setPage(1); }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            unreadOnly
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {unreadOnly ? 'Unread Only' : 'All Alerts'}
        </button>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`rounded-lg p-4 border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{alert.title}</h3>
                  {alert.description && (
                    <p className="text-sm opacity-90 mb-2">{alert.description}</p>
                  )}
                  {alert.assetId && (
                    <p className="text-sm opacity-75">
                      Asset: {alert.assetId.assetId} ({alert.assetId.location})
                    </p>
                  )}
                  <p className="text-xs opacity-60 mt-2">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {!(Array.isArray(alert.isRead) && alert.isRead.includes(localStorage.getItem('userId') || '')) ? (
                    <button
                      onClick={() => markAsRead(alert._id)}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition"
                    >
                      Mark Read
                    </button>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 opacity-50" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No alerts to display</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-slate-800 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-slate-400">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-slate-800 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
