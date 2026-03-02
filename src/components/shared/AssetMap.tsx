import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { InfrastructureAsset } from '../../types/database';

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const markerColors: Record<string, string> = {
  Good: '#10b981',
  Moderate: '#f59e0b',
  Poor: '#ef4444',
};

function toNum(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function createIcon(condition: string) {
  const color = markerColors[condition] || '#6b7280';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function FitBounds({ assets }: { assets: InfrastructureAsset[] }) {
  const map = useMap();
  useEffect(() => {
    const withCoords = assets.filter((a) => toNum(a.latitude) != null && toNum(a.longitude) != null);
    if (withCoords.length === 1) {
      const lat = toNum(withCoords[0].latitude)!;
      const lng = toNum(withCoords[0].longitude)!;
      map.setView([lat, lng], 14);
    } else if (withCoords.length > 1) {
      const points = withCoords.map((a) => [toNum(a.latitude)!, toNum(a.longitude)!] as [number, number]);
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  }, [map, assets]);
  return null;
}

interface Props {
  assets: InfrastructureAsset[];
  height?: string;
}

export default function AssetMap({ assets, height = '400px' }: Props) {
  const withCoords = assets.filter((a) => toNum(a.latitude) != null && toNum(a.longitude) != null);

  if (withCoords.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-center text-slate-500" style={{ height }}>
        Add latitude & longitude to assets to see them on the map
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700" style={{ height }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={5}
        className="h-full w-full"
        style={{ background: '#0f172a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds assets={withCoords} />
        {withCoords.map((a) => {
          const lat = toNum(a.latitude)!;
          const lng = toNum(a.longitude)!;
          return (
          <Marker
            key={a._id}
            position={[lat, lng]}
            icon={createIcon(a.condition)}
          >
            <Popup>
              <div className="text-slate-800 text-sm">
                <p className="font-semibold">{a.assetId} – {a.type}</p>
                <p>{a.location}</p>
                <p>Zone: {a.zone} · {a.condition} · {a.priorityLevel}</p>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
