import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

export type ParsedRow = {
  External_Key: string;
  Name: string;
  Description?: string;
  Status?: string;
  Priority?: string;
  Start_Date?: string;
  End_Date?: string;
  Baseline_Start_Date?: string;
  Baseline_End_Date?: string;
  Duration?: number;
  Milestone_Name?: string;
  Parent_External_Key?: string;
  Dependencies?: string; // KEY:type:lag, comma-separated
  Sort_Order?: number;
  Progress?: number;
};

const STATUS_MAP: Record<string, string> = {
  'not started': 'Not Started',
  'in progress': 'In Progress',
  'completed': 'Completed',
  'on hold': 'On Hold',
  'cancelled': 'Cancelled',
};

const PRIORITY_MAP: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

function normalizeStatus(s?: string) {
  if (!s) return undefined;
  const key = s.trim().toLowerCase();
  return STATUS_MAP[key] || undefined;
}

function normalizePriority(p?: string) {
  if (!p) return undefined;
  const key = p.trim().toLowerCase();
  return PRIORITY_MAP[key] || undefined;
}

function toISODate(d?: string) {
  if (d === undefined || d === null) return undefined;
  const t = String(d).trim();
  if (!t) return undefined;
  // Already ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;

  // Excel serial day number (since 1899-12-30)
  if (/^\d{5,6}$/.test(t)) {
    const serial = Number(t);
    if (!isNaN(serial) && serial >= 25569 && serial < 700000) {
      const ms = Math.round((serial - 25569) * 86400 * 1000);
      const date = new Date(ms);
      return date.toISOString().slice(0, 10);
    }
  }

  // Handle common delimited formats (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(t)) {
    const sep = t.includes('/') ? '/' : '-';
    const parts = t.split(sep).map(p => p.trim());

    // If last part has 4 digits, we assume it's the year
    if (/^\d{4}$/.test(parts[2])) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      // If first part > 12, treat as DD/MM/YYYY, else MM/DD/YYYY
      const m = p0 > 12 ? p1 : p0;
      const dnum = p0 > 12 ? p0 : p1;
      const date = new Date(Date.UTC(y, m - 1, dnum));
      if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
    } else if (/^\d{4}$/.test(parts[0])) {
      // YYYY-M-D
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const dnum = parseInt(parts[2], 10);
      const date = new Date(Date.UTC(y, m - 1, dnum));
      if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
    }
  }

  // YYYYMMDD
  if (/^\d{8}$/.test(t)) {
    const y = Number(t.slice(0, 4));
    const m = Number(t.slice(4, 6));
    const dnum = Number(t.slice(6, 8));
    const date = new Date(Date.UTC(y, m - 1, dnum));
    if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }

  // Fallback: native Date parse
  const dt = new Date(t);
  if (!isNaN(dt.getTime())) {
    return dt.toISOString().slice(0, 10);
  }
  return undefined;
}

function mapDepType(typeRaw?: string) {
  const t = (typeRaw || '').toLowerCase();
  switch (t) {
    case 'fs':
    case 'finish-to-start':
      return 'finish-to-start';
    case 'ss':
    case 'start-to-start':
      return 'start-to-start';
    case 'ff':
    case 'finish-to-finish':
      return 'finish-to-finish';
    case 'sf':
    case 'start-to-finish':
      return 'start-to-finish';
    default:
      return 'finish-to-start';
  }
}

export class BulkTaskImportService {
  static async parseFile(file: File): Promise<ParsedRow[]> {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets['Tasks'] || wb.Sheets['Tasks_Template'] || wb.Sheets[wb.SheetNames[1] || wb.SheetNames[0]];
    if (!ws) return [];
    const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as any[];

    // Ensure keys match expected headers where possible
    return json.map((row) => ({
      External_Key: String(row.External_Key || row.external_key || row.Key || '').trim(),
      Name: String(row.Name || row.Task_Name || row.Task || '').trim(),
      Description: String(row.Description || row.Desc || ''),
      Status: String(row.Status || ''),
      Priority: String(row.Priority || ''),
      Start_Date: String(row.Start_Date || row.Start || ''),
      End_Date: String(row.End_Date || row.End || ''),
      Baseline_Start_Date: String(row.Baseline_Start_Date || ''),
      Baseline_End_Date: String(row.Baseline_End_Date || ''),
      Duration: row.Duration !== undefined && row.Duration !== '' ? Number(row.Duration) : undefined,
      Milestone_Name: String(row.Milestone_Name || row.Milestone || ''),
      Parent_External_Key: String(row.Parent_External_Key || row.Parent || ''),
      Dependencies: String(row.Dependencies || ''),
      Sort_Order: row.Sort_Order !== undefined && row.Sort_Order !== '' ? Number(row.Sort_Order) : undefined,
      Progress: row.Progress !== undefined && row.Progress !== '' ? Number(row.Progress) : undefined,
    })).filter(r => r.External_Key && r.Name);
  }

  static async importTasks(projectId: string, rows: ParsedRow[]) {
    if (!projectId) throw new Error('Missing project id');
    if (!rows.length) return { inserted: 0, updated: 0, warnings: [] as string[] };

    // Resolve milestones by name
    const milestoneNames = Array.from(new Set(rows.map(r => (r.Milestone_Name || '').trim()).filter(Boolean)));
    const milestoneMap = new Map<string, string>();
    if (milestoneNames.length) {
      const { data: milestones, error } = await supabase
        .from('milestones')
        .select('id,name')
        .in('name', milestoneNames)
        .eq('project_id', projectId);
      if (!error && milestones) {
        milestones.forEach(m => milestoneMap.set(m.name, m.id));
      }
    }

    // Build insert payload (pass 1)
    const insertPayload = rows.map(r => {
      let start = toISODate(r.Start_Date);
      let end = toISODate(r.End_Date);
      const baselineStart = toISODate(r.Baseline_Start_Date);
      const baselineEnd = toISODate(r.Baseline_End_Date);

      // Normalize duration
      let duration = r.Duration !== undefined && r.Duration !== null
        ? Number(r.Duration)
        : undefined;

      // Derive missing dates from available info
      if (!duration && start && end) {
        const d0 = new Date(start);
        const d1 = new Date(end);
        const days = Math.floor((d1.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        duration = Math.max(1, days);
      } else if (duration && start && !end) {
        const d0 = new Date(start + 'T00:00:00Z');
        const d1 = new Date(d0.getTime() + (duration - 1) * 86400000);
        end = d1.toISOString().slice(0, 10);
      } else if (duration && !start && end) {
        const d1 = new Date(end + 'T00:00:00Z');
        const d0 = new Date(d1.getTime() - (duration - 1) * 86400000);
        start = d0.toISOString().slice(0, 10);
      } else if (!duration && (start || end)) {
        // Only one date provided and no duration -> single-day task
        duration = 1;
        if (start && !end) end = start;
        if (!start && end) start = end;
      }

      // Final defaults
      if (!duration) duration = 1;

      const status = normalizeStatus(r.Status) || 'Not Started';
      const priority = normalizePriority(r.Priority) || 'Medium';
      const progress = Math.max(0, Math.min(100, r.Progress ?? (status === 'Completed' ? 100 : 0)));

      return {
        _extKey: r.External_Key, // local only
        project_id: projectId,
        name: r.Name,
        description: r.Description || null,
        status,
        priority,
        start_date: start || null,
        end_date: end || null,
        baseline_start_date: baselineStart || null,
        baseline_end_date: baselineEnd || null,
        duration,
        milestone_id: r.Milestone_Name ? milestoneMap.get(r.Milestone_Name) ?? null : null,
        parent_task_id: null,
        hierarchy_level: 0,
        sort_order: r.Sort_Order ?? 0,
        progress,
        dependencies: [],
      } as any;
    });

    // Insert in batch and get ids
    const { data: inserted, error: insertErr } = await supabase
      .from('project_tasks')
      .insert(insertPayload.map(({ _extKey, ...db }) => db))
      .select('id');

    if (insertErr) throw insertErr;
    const extToId = new Map<string, string>();
    inserted?.forEach((row, idx) => {
      const ext = insertPayload[idx]._extKey as string;
      if (ext) extToId.set(ext, row.id);
    });

    // Build updates for hierarchy and dependencies (pass 2)
    const updates: { id: string; parent_task_id?: string | null; dependencies?: string[] }[] = [];
    const cascadeIds = new Set<string>();

    rows.forEach((r) => {
      const id = extToId.get(r.External_Key);
      if (!id) return;

      let parentId: string | null | undefined = undefined;
      if (r.Parent_External_Key) {
        parentId = extToId.get(r.Parent_External_Key) || null;
      }

      const deps: string[] = [];
      if (r.Dependencies) {
        r.Dependencies.split(',').map(s => s.trim()).filter(Boolean).forEach(depStr => {
          const parts = depStr.split(':').map(p => p.trim());
          const ext = parts[0];
          const type = mapDepType(parts[1]);
          const lag = Number(parts[2] || 0) || 0;
          const depId = extToId.get(ext || '');
          if (depId) {
            deps.push(`${depId}:${type}:${lag}`);
          }
        });
      }

      const upd: { id: string; parent_task_id?: string | null; dependencies?: string[] } = { id };
      if (parentId !== undefined) upd.parent_task_id = parentId;
      if (deps.length) {
        upd.dependencies = deps;
        cascadeIds.add(id);
      }
      if (upd.parent_task_id !== undefined || upd.dependencies) updates.push(upd);
    });

    // Apply updates sequentially (hierarchy can impact triggers)
    for (const u of updates) {
      const { error: upErr } = await supabase
        .from('project_tasks')
        .update({ parent_task_id: u.parent_task_id ?? null, dependencies: u.dependencies ?? [] })
        .eq('id', u.id);
      if (upErr) throw upErr;
    }

    // Trigger cascade updates for tasks with dependencies
    for (const id of cascadeIds) {
      // @ts-ignore - RPC signature
      await supabase.rpc('cascade_dependency_updates', { updated_task_id: id });
    }

    return { inserted: inserted?.length || 0, updated: updates.length, warnings: [] as string[] };
  }

  static async patchMissingDates(projectId: string) {
    if (!projectId) throw new Error('Missing project id');

    const { data: tasks, error } = await supabase
      .from('project_tasks')
      .select('id,start_date,end_date,duration')
      .eq('project_id', projectId);

    if (error) throw error;
    if (!tasks || !tasks.length) return { updated: 0 };

    let updated = 0;
    for (const t of tasks) {
      let start = t.start_date as string | null;
      let end = t.end_date as string | null;
      let duration = (t.duration as number | null) ?? null;

      const hasMissing = !start || !end || !duration || duration <= 0;
      if (!hasMissing) continue;

      if (!duration && start && end) {
        const d0 = new Date(start + 'T00:00:00Z');
        const d1 = new Date(end + 'T00:00:00Z');
        duration = Math.max(1, Math.floor((d1.getTime() - d0.getTime()) / 86400000) + 1);
      }

      if (duration && start && !end) {
        const d0 = new Date(start + 'T00:00:00Z');
        const d1 = new Date(d0.getTime() + (duration - 1) * 86400000);
        end = d1.toISOString().slice(0, 10);
      } else if (duration && !start && end) {
        const d1 = new Date(end + 'T00:00:00Z');
        const d0 = new Date(d1.getTime() - (duration - 1) * 86400000);
        start = d0.toISOString().slice(0, 10);
      } else if (!start && !end) {
        // default to today
        const today = new Date();
        const iso = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0, 10);
        start = iso;
        end = iso;
        if (!duration || duration <= 0) duration = 1;
      } else if (!duration) {
        duration = 1;
      }

      const { error: upErr } = await supabase
        .from('project_tasks')
        .update({ start_date: start, end_date: end, duration })
        .eq('id', t.id);
      if (upErr) throw upErr;
      updated++;
    }

    return { updated };
  }
}
