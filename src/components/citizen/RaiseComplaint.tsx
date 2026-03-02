import { useState, useRef } from 'react';
import { api } from '../../lib/api';
import type { InfrastructureAsset } from '../../types/database';
import { Image, Mic, Square, Loader2 } from 'lucide-react';

interface Props {
  assets: InfrastructureAsset[];
  onSuccess: () => void;
}

export default function RaiseComplaint({ assets, onSuccess }: Props) {
  const [assetId, setAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [recording, setRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const selectedAsset = assets.find((a) => a._id === assetId);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        if (chunksRef.current.length) {
          setVoiceBlob(new Blob(chunksRef.current, { type: 'audio/webm' }));
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      setError('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setRecording(false);
    }
  };

  const removeVoice = () => setVoiceBlob(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDone(false);
    try {
      const formData = new FormData();
      formData.append('assetId', assetId);
      formData.append('description', description);
      photos.forEach((f) => formData.append('photos', f));
      if (voiceBlob) formData.append('voiceNote', voiceBlob, 'voice.webm');
      await api.complaints.create(formData);
      setDescription('');
      setAssetId('');
      setPhotos([]);
      setVoiceBlob(null);
      setDone(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  if (assets.length === 0) {
    return <p className="text-slate-500">No assets available to file a complaint against.</p>;
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Raise a Complaint</h2>
      {done && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-sm">
          Complaint submitted. You can track it under &quot;My Complaints&quot;.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/80 border border-slate-700 rounded-xl p-6">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Select asset</label>
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
            required
          >
            <option value="">Choose an asset</option>
            {assets.map((a) => (
              <option key={a._id} value={a._id}>
                {a.assetId} - {a.type} ({a.zone})
              </option>
            ))}
          </select>
          {selectedAsset && (
            <p className="text-slate-500 text-xs mt-1">
              {selectedAsset.location} · Condition: {selectedAsset.condition}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500"
            placeholder="Describe the issue..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            <Image className="w-4 h-4 inline mr-1" /> Photos (optional, max 5)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotos(Array.from(e.target.files || []).slice(0, 5))}
            className="w-full text-slate-400 text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-slate-700 file:text-slate-200"
          />
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {photos.map((f, i) => (
                <span key={i} className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            <Mic className="w-4 h-4 inline mr-1" /> Voice note (optional)
          </label>
          <div className="flex items-center gap-2">
            {!recording && !voiceBlob && (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm"
              >
                <Mic className="w-4 h-4" /> Record
              </button>
            )}
            {recording && (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/30 text-red-400 hover:bg-red-500/50 text-sm"
              >
                <Square className="w-4 h-4" /> Stop
              </button>
            )}
            {voiceBlob && !recording && (
              <div className="flex items-center gap-2">
                <audio src={URL.createObjectURL(voiceBlob)} controls className="h-8 max-w-[200px]" />
                <button
                  type="button"
                  onClick={removeVoice}
                  className="text-slate-400 hover:text-red-400 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}
