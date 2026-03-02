import { useState } from 'react';
import { api } from '../../lib/api';
import type { Complaint } from '../../types/database';
import { Star, ThumbsUp } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_BASE = API_BASE.replace('/api', '') || '';

function getUploadUrl(path: string) {
  if (path.startsWith('http')) return path;
  return `${UPLOADS_BASE}${path}`;
}

interface Props {
  complaints: Complaint[];
  onUpdate: () => void;
}

export default function CitizenComplaints({ complaints, onUpdate }: Props) {
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const assetInfo = (c: Complaint) => {
    const a = c.assetId;
    if (typeof a === 'object' && a !== null && 'assetId' in a) return `${a.assetId} - ${a.type} (${a.location})`;
    return String(a);
  };

  const submitFeedback = async (id: string) => {
    setFeedbackError(null);
    setSubmitting(true);
    try {
      await api.complaints.submitFeedback(id, rating, comment);
      setFeedbackOpen(null);
      setRating(5);
      setComment('');
      onUpdate();
    } catch (e) {
      setFeedbackError(e instanceof Error ? e.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (complaints.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-8 text-center text-slate-500">
        You haven&apos;t raised any complaints yet. Use &quot;Raise Complaint&quot; to report an issue with an asset.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Complaints</h2>
      <div className="space-y-3">
        {complaints.map((c) => (
          <div
            key={c._id}
            className="bg-slate-900/80 border border-slate-700 rounded-xl p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="font-mono text-slate-300 text-sm">{c.complaintId}</span>
              <span className={
                c.status === 'Resolved' ? 'text-emerald-400' :
                c.status === 'In Progress' ? 'text-amber-400' : 'text-slate-400'
              }>
                {c.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Asset: {assetInfo(c)}</p>
            <p className="text-slate-200">{c.description}</p>
            {c.photos && c.photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {c.photos.map((url, i) => (
                  <a
                    key={i}
                    href={getUploadUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={getUploadUrl(url)}
                      alt={`Attachment ${i + 1}`}
                      className="h-20 w-20 object-cover rounded border border-slate-600"
                    />
                  </a>
                ))}
              </div>
            )}
            {c.voiceNoteUrl && (
              <div className="mt-2">
                <audio src={getUploadUrl(c.voiceNoteUrl)} controls className="h-8 max-w-full" />
              </div>
            )}
            {c.feedback?.submittedAt && (
              <div className="mt-2 flex items-center gap-2 text-slate-400 text-sm">
                <ThumbsUp className="w-4 h-4" />
                Feedback: {c.feedback.rating}/5 stars
                {c.feedback.comment && <span>— {c.feedback.comment}</span>}
              </div>
            )}
            {c.status === 'Resolved' && !c.feedback?.submittedAt && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                {feedbackOpen === c._id ? (
                  <div className="space-y-2">
                    {feedbackError && (
                      <p className="text-red-400 text-sm">{feedbackError}</p>
                    )}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRating(r)}
                          className="p-1"
                        >
                          <Star className={`w-6 h-6 ${r <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Optional comment"
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => submitFeedback(c._id)}
                        disabled={submitting}
                        className="px-3 py-1 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-500 disabled:opacity-50"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setFeedbackOpen(null)}
                        className="px-3 py-1 rounded border border-slate-600 text-slate-400 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setFeedbackOpen(c._id)}
                    className="text-emerald-400 hover:underline text-sm flex items-center gap-1"
                  >
                    <Star className="w-4 h-4" /> Give feedback
                  </button>
                )}
              </div>
            )}
            <p className="text-slate-500 text-xs mt-2">{new Date(c.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
