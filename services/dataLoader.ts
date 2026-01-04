
import { PricePoint } from "../types";

export const parseCSVData = (content: string): Record<string, PricePoint[]> => {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return {};

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const dIdx = headers.findIndex(h => h.includes('date'));
  const cIdx = headers.findIndex(h => h.includes('close'));
  const oIdx = headers.findIndex(h => h.includes('open'));
  const hIdx = headers.findIndex(h => h.includes('high'));
  const lIdx = headers.findIndex(h => h.includes('low'));
  const vIdx = headers.findIndex(h => h.includes('vol'));
  const sIdx = headers.findIndex(h => h.includes('ticker') || h.includes('symbol'));

  if (dIdx === -1 || cIdx === -1) {
    throw new Error("CSV thiếu cột Date hoặc Close.");
  }

  const inventory: Record<string, PricePoint[]> = {};

  lines.slice(1).forEach(l => {
    const cols = l.split(',');
    if (cols.length < headers.length) return;

    const sym = sIdx !== -1 ? cols[sIdx].trim().toUpperCase() : 'UNKNOWN';
    let date = cols[dIdx].trim();
    
    // Normalize date YYYYMMDD to YYYY-MM-DD
    if (/^\d{8}$/.test(date)) {
      date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    }

    if (!inventory[sym]) inventory[sym] = [];

    inventory[sym].push({
      date,
      open: parseFloat(cols[oIdx]) || 0,
      high: parseFloat(cols[hIdx]) || 0,
      low: parseFloat(cols[lIdx]) || 0,
      close: parseFloat(cols[cIdx]) || 0,
      volume: parseInt(cols[vIdx]) || 0
    });
  });

  // Sort each symbol's prices by date
  Object.keys(inventory).forEach(s => {
    inventory[s].sort((a, b) => a.date.localeCompare(b.date));
  });

  return inventory;
};

export const fetchDefaultData = async (): Promise<Record<string, PricePoint[]>> => {
  try {
    const response = await fetch('./data.csv');
    if (!response.ok) throw new Error('Could not fetch default data.csv');
    const content = await response.text();
    return parseCSVData(content);
  } catch (error) {
    console.warn('Default CSV load failed, using fallbacks.', error);
    return {};
  }
};
