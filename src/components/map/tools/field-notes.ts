// src/components/map/tools/field-notes.ts
// Phase 12D — Geo-tagged field notes tool
// Click map → create timestamped note with lat/lng
// Persistent markers on map. Export as CSV/JSON.

import type { ToolHandler, ToolActivateOptions, ToolResult } from '@/types/map-tools';
import { formatDD, createVertexMarker, TOOL_COLORS } from './tool-utils';

const STORAGE_KEY = 'findlos_field_notes';

interface FieldNote {
  id: string;
  lat: number;
  lng: number;
  text: string;
  timestamp: number;
  category: 'observation' | 'issue' | 'measurement' | 'photo' | 'general';
}

// ─── State ───
let _map: google.maps.Map | null = null;
let _markers: google.maps.Marker[] = [];
let _notes: FieldNote[] = [];
let _infoWindow: google.maps.InfoWindow | null = null;

function loadNotes(): FieldNote[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveNotes(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_notes));
  } catch {
    // localStorage full or unavailable
  }
}

function showNoteInput(latLng: google.maps.LatLng, options: ToolActivateOptions): void {
  if (!_map) return;

  // Close previous info window
  _infoWindow?.close();

  _infoWindow = new google.maps.InfoWindow({
    position: latLng,
    content: `
      <div style="font-family:system-ui,sans-serif;min-width:220px;padding:4px">
        <div style="font-size:12px;font-weight:600;color:#E2E8F0;margin-bottom:6px">📝 Add Field Note</div>
        <textarea id="fn-text" rows="3" placeholder="Enter note..." style="width:100%;padding:6px;border-radius:6px;border:1px solid #334155;background:#1E293B;color:#E2E8F0;font-size:12px;resize:none;outline:none;font-family:inherit"></textarea>
        <div style="display:flex;gap:4px;margin-top:6px">
          <select id="fn-cat" style="flex:1;padding:4px 6px;border-radius:6px;border:1px solid #334155;background:#1E293B;color:#E2E8F0;font-size:11px;outline:none">
            <option value="general">General</option>
            <option value="observation">Observation</option>
            <option value="issue">Issue</option>
            <option value="measurement">Measurement</option>
            <option value="photo">Photo Ref</option>
          </select>
          <button id="fn-save" style="padding:4px 12px;border-radius:6px;border:none;background:#3B82F6;color:white;font-size:11px;font-weight:600;cursor:pointer">Save</button>
        </div>
      </div>
    `,
  });

  _infoWindow.open(_map);

  // Wait for DOM then attach listener
  google.maps.event.addListenerOnce(_infoWindow, 'domready', () => {
    const saveBtn = document.getElementById('fn-save');
    const textArea = document.getElementById('fn-text') as HTMLTextAreaElement | null;
    const catSelect = document.getElementById('fn-cat') as HTMLSelectElement | null;

    if (saveBtn && textArea) {
      saveBtn.addEventListener('click', () => {
        const text = textArea.value.trim();
        if (!text) return;

        const note: FieldNote = {
          id: `fn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          lat: latLng.lat(),
          lng: latLng.lng(),
          text,
          timestamp: Date.now(),
          category: (catSelect?.value || 'general') as FieldNote['category'],
        };

        _notes.push(note);
        saveNotes();

        // Add marker
        addNoteMarker(note);

        _infoWindow?.close();

        options.onStatusChange(`Note saved at ${formatDD(note.lat, note.lng)}. ${_notes.length} total notes.`);
        options.onResult(buildResult());
      });
    }
  });
}

function addNoteMarker(note: FieldNote): void {
  if (!_map) return;

  const categoryIcons: Record<string, string> = {
    general: '📝',
    observation: '👁',
    issue: '⚠',
    measurement: '📏',
    photo: '📷',
  };

  const icon = categoryIcons[note.category] || '📝';
  const marker = createVertexMarker(
    new google.maps.LatLng(note.lat, note.lng),
    _map,
    TOOL_COLORS.pin.stroke,
    icon,
  );

  // Click marker to view note
  marker.setClickable(true);
  marker.addListener('click', () => {
    if (!_map) return;
    const iw = new google.maps.InfoWindow({
      content: `
        <div style="font-family:system-ui,sans-serif;max-width:250px;padding:4px">
          <div style="font-size:10px;color:#94A3B8;margin-bottom:2px">${new Date(note.timestamp).toLocaleString()}</div>
          <div style="font-size:12px;color:#E2E8F0;font-weight:500">${escapeHtml(note.text)}</div>
          <div style="font-size:10px;color:#64748B;margin-top:4px">${formatDD(note.lat, note.lng)} · ${note.category}</div>
        </div>
      `,
    });
    iw.open(_map, marker);
  });

  _markers.push(marker);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildResult(): ToolResult {
  return {
    toolId: 'field-notes',
    timestamp: Date.now(),
    data: {
      totalNotes: _notes.length,
      notes: _notes.map(n => ({
        id: n.id,
        text: n.text.slice(0, 50) + (n.text.length > 50 ? '...' : ''),
        location: formatDD(n.lat, n.lng),
        category: n.category,
        time: new Date(n.timestamp).toLocaleString(),
      })),
      exportAvailable: _notes.length > 0,
    },
    overlays: _markers.slice(),
  };
}

function clearAll(): void {
  _markers.forEach(m => m.setMap(null));
  _markers = [];
  _infoWindow?.close();
  _infoWindow = null;
}

export const fieldNotes: ToolHandler = {
  activate(options: ToolActivateOptions) {
    _map = options.map;
    _notes = loadNotes();

    // Show existing notes on map
    _notes.forEach(note => addNoteMarker(note));

    options.onStatusChange(
      _notes.length > 0
        ? `${_notes.length} note(s) loaded. Click map to add more.`
        : 'Click any point on the map to add a geo-tagged field note.'
    );

    if (_notes.length > 0) {
      options.onResult(buildResult());
    }
  },

  deactivate() {
    _infoWindow?.close();
    _map = null;
  },

  handleClick(latLng: google.maps.LatLng, options: ToolActivateOptions) {
    showNoteInput(latLng, options);
  },

  getCursor() {
    return 'crosshair';
  },
};

// Export helpers
export function exportFieldNotesCSV(): string {
  const notes = loadNotes();
  const header = 'ID,Latitude,Longitude,Category,Note,Timestamp';
  const rows = notes.map(n =>
    `${n.id},${n.lat},${n.lng},${n.category},"${n.text.replace(/"/g, '""')}",${new Date(n.timestamp).toISOString()}`
  );
  return [header, ...rows].join('\n');
}

export function exportFieldNotesJSON(): string {
  return JSON.stringify(loadNotes(), null, 2);
}

(fieldNotes as { clearAll?: () => void }).clearAll = clearAll;
