import { jsPDF } from 'jspdf';
import type { InfrastructureAsset, Complaint, DashboardAnalytics } from '../types/database';

function escapeCsv(val: unknown): string {
  const s = (val ?? '').toString().replace(/"/g, '""');
  return `"${s}"`;
}

export function exportAssetsCsv(assets: InfrastructureAsset[], filename = 'smartinfra-assets.csv') {
  if (assets.length === 0) return;
  const headers = ['assetId', 'type', 'location', 'zone', 'condition', 'status', 'complaintCount', 'priorityLevel', 'createdAt'];
  const rows = assets.map((a) => [
    a.assetId,
    a.type,
    a.location,
    a.zone,
    a.condition,
    a.status,
    String(a.complaintCount ?? 0),
    a.priorityLevel,
    a.createdAt ? new Date(a.createdAt).toISOString() : '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n');
  downloadBlob(csv, filename, 'text/csv;charset=utf-8;');
}

export function exportComplaintsCsv(complaints: Complaint[], filename = 'smartinfra-complaints.csv') {
  if (complaints.length === 0) return;
  const headers = ['complaintId', 'assetId', 'zone', 'citizenName', 'status', 'description', 'createdAt'];
  const rows = complaints.map((c) => {
    const asset = c.assetId as { assetId?: string; zone?: string } | null;
    const assetId = asset && typeof asset === 'object' && asset.assetId ? asset.assetId : String(c.assetId);
    const zone = asset && typeof asset === 'object' && asset.zone ? asset.zone : '';
    return [
      c.complaintId,
      assetId,
      zone,
      c.citizenName,
      c.status,
      (c.description || '').slice(0, 100),
      c.createdAt ? new Date(c.createdAt).toISOString() : '',
    ];
  });
  const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n');
  downloadBlob(csv, filename, 'text/csv;charset=utf-8;');
}

function addTableToPdf(doc: jsPDF, startY: number, headers: string[], rows: string[][], colWidths: number[]) {
  const lineHeight = 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  let x = 14;
  headers.forEach((h, i) => {
    doc.text(h, x, startY);
    x += colWidths[i] ?? 40;
  });
  doc.setFont('helvetica', 'normal');
  let y = startY + lineHeight;
  rows.forEach((row) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    x = 14;
    row.forEach((cell, i) => {
      doc.text(String(cell).slice(0, 25), x, y);
      x += colWidths[i] ?? 40;
    });
    y += lineHeight;
  });
}

export function exportCitizenSummaryPdf(
  assets: InfrastructureAsset[],
  complaints: Complaint[],
  filename = 'smartinfra-my-summary.pdf'
) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('SmartInfra – My Summary', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  let y = 38;
  doc.setFontSize(12);
  doc.text(`My Complaints: ${complaints.length}`, 14, y);
  y += 8;
  doc.text(`Assets Viewed: ${assets.length}`, 14, y);
  y += 12;
  if (complaints.length > 0) {
    doc.setFontSize(11);
    doc.text('My Complaints', 14, y);
    y += 8;
    const headers = ['ID', 'Asset', 'Status', 'Date'];
    const rows = complaints.slice(0, 25).map((c) => {
      const asset = c.assetId as { assetId?: string } | null;
      const assetId = asset && typeof asset === 'object' && asset.assetId ? asset.assetId : '-';
      return [c.complaintId, assetId, c.status, new Date(c.createdAt).toLocaleDateString()];
    });
    addTableToPdf(doc, y, headers, rows, [35, 45, 35, 35]);
  }
  doc.save(filename);
}

export function exportSummaryPdf(
  analytics: DashboardAnalytics,
  assets: InfrastructureAsset[],
  complaints: Complaint[],
  filename = 'smartinfra-summary.pdf'
) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('SmartInfra – City Infrastructure Summary', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  let y = 38;

  doc.setFontSize(12);
  doc.text('Overview', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Total Assets: ${analytics.totalAssets}`, 14, y);
  y += 6;
  doc.text(`Total Complaints: ${analytics.totalComplaints}`, 14, y);
  y += 6;
  doc.text(`High Priority Assets: ${analytics.highPriorityAssetCount}`, 14, y);
  y += 6;
  doc.text(`City Health Index: ${analytics.cityHealthIndex}%`, 14, y);
  y += 6;
  doc.text(`Pending Complaints: ${analytics.pendingComplaints}`, 14, y);
  y += 10;

  doc.text(`Assets by Condition: Good ${analytics.assetsByCondition.Good}, Moderate ${analytics.assetsByCondition.Moderate}, Poor ${analytics.assetsByCondition.Poor}`, 14, y);
  y += 12;

  if (assets.length > 0) {
    doc.addPage();
    doc.setFontSize(12);
    doc.text('Assets (sample)', 14, 20);
    const headers = ['Asset ID', 'Type', 'Zone', 'Condition', 'Status', 'Priority'];
    const rows = assets.slice(0, 30).map((a) => [
      a.assetId,
      a.type,
      a.zone,
      a.condition,
      a.status,
      a.priorityLevel,
    ]);
    addTableToPdf(doc, 26, headers, rows, [30, 35, 30, 28, 35, 25]);
  }

  if (complaints.length > 0) {
    doc.addPage();
    doc.setFontSize(12);
    doc.text('Complaints (sample)', 14, 20);
    const headers = ['ID', 'Asset', 'Zone', 'Citizen', 'Status'];
    const rows = complaints.slice(0, 30).map((c) => {
      const asset = c.assetId as { assetId?: string; zone?: string } | null;
      const assetId = asset && typeof asset === 'object' && asset.assetId ? asset.assetId : '-';
      const zone = asset && typeof asset === 'object' && asset.zone ? asset.zone : '-';
      return [c.complaintId, assetId, zone, c.citizenName, c.status];
    });
    addTableToPdf(doc, 26, headers, rows, [35, 40, 35, 40, 30]);
  }

  doc.save(filename);
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
