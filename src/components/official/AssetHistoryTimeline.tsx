import { useState, useEffect } from 'react';
import { History, ArrowUp, ArrowDown } from 'lucide-react';

export default function AssetHistoryTimeline({ assetId }: { assetId: string }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      const response = await fetch(`/api/asset-history/asset/${assetId}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      }
    } catch (error) {
      // graceful fallback when API or notifications aren't available
      // eslint-disable-next-line no-console
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-slate-400">Loading change history…</div>
    );
  }

  const getChangeIcon = (changeType: string) => {
    return changeType.includes('Change') ? <ArrowUp className="w-4 h-4" /> : <History className="w-4 h-4" />;
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'Condition Change': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'Status Change': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'Maintenance': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      default: return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <History className="w-5 h-5 text-emerald-500" />
        Change History
      </h3>

      {history.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-slate-700" />

          <div className="space-y-4">
            {history.map((item) => {
              const action = item.action || 'Update';
              return (
                <div key={item._id} className="relative pl-16">
                  {/* Timeline dot */}
                  <div className="absolute left-1 top-2 w-12 h-12 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center">
                    {getChangeIcon(action)}
                  </div>

                  {/* Content */}
                  <div className={`rounded-lg p-4 border ${getChangeColor(action)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold">{action}</span>
                      <span className="text-xs opacity-75">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-sm mb-2">{item.description}</p>
                    )}

                    {item.details && (
                      <pre className="text-xs bg-slate-800 p-2 rounded mb-2 overflow-auto">
                        {JSON.stringify(item.details, null, 2)}
                      </pre>
                    )}

                    {item.changedByName && (
                      <p className="text-xs text-slate-400 mt-2">
                        Changed by: {item.changedByName}
                      </p>
                    )}
                  </div>
                </div>
              );
            }))
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-400">No history available</p>
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
