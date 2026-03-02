import type { InfrastructureAsset } from '../../types/database';

interface Props {
  assets: InfrastructureAsset[];
}

export default function CitizenAssetList({ assets }: Props) {
  const priorityColor = (level: string) =>
    level === 'High' ? 'text-red-400' : level === 'Medium' ? 'text-amber-400' : 'text-slate-400';

  if (assets.length === 0) {
    return <p className="text-slate-500 py-8">No assets match your filters.</p>;
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
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a._id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                <td className="px-4 py-3 text-slate-200 font-mono text-sm">{a.assetId}</td>
                <td className="px-4 py-3 text-slate-300">{a.type}</td>
                <td className="px-4 py-3 text-slate-300">{a.location}</td>
                <td className="px-4 py-3 text-slate-300">{a.zone}</td>
                <td className="px-4 py-3">
                  <span className={
                    a.condition === 'Good' ? 'text-emerald-400' :
                    a.condition === 'Moderate' ? 'text-amber-400' : 'text-red-400'
                  }>
                    {a.condition}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{a.status}</td>
                <td className={`px-4 py-3 font-medium ${priorityColor(a.priorityLevel)}`}>{a.priorityLevel}</td>
                <td className="px-4 py-3 text-slate-400">{a.complaintCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
