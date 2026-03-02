import { FileSpreadsheet, FileText } from 'lucide-react';
import { exportAssetsCsv, exportComplaintsCsv, exportSummaryPdf, exportCitizenSummaryPdf } from '../../lib/exportUtils';
import type { InfrastructureAsset, Complaint, DashboardAnalytics } from '../../types/database';

interface ExportButtonsProps {
  assets: InfrastructureAsset[];
  complaints: Complaint[];
  analytics?: DashboardAnalytics | null;
  /** Citizen sees only their complaints; official sees all */
  variant?: 'citizen' | 'official';
}

export default function ExportButtons({ assets, complaints, analytics, variant = 'official' }: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        type="button"
        onClick={() => exportAssetsCsv(assets)}
        disabled={assets.length === 0}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download assets as CSV (Excel compatible)"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Export assets CSV
      </button>
      <button
        type="button"
        onClick={() => exportComplaintsCsv(complaints)}
        disabled={complaints.length === 0}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download complaints as CSV (Excel compatible)"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Export complaints CSV
      </button>
      {variant === 'official' && analytics && (
        <button
          type="button"
          onClick={() => exportSummaryPdf(analytics, assets, complaints)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-sm hover:bg-slate-700"
          title="Download summary as PDF"
        >
          <FileText className="w-4 h-4" />
          Export PDF summary
        </button>
      )}
      {variant === 'citizen' && (assets.length > 0 || complaints.length > 0) && (
        <button
          type="button"
          onClick={() => exportCitizenSummaryPdf(assets, complaints)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-sm hover:bg-slate-700"
          title="Download my summary as PDF"
        >
          <FileText className="w-4 h-4" />
          Export PDF summary
        </button>
      )}
    </div>
  );
}
