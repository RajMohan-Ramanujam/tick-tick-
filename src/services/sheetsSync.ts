import { Task, KanbanSection, CustomList } from '../types';
import { normalizeDateStr } from '../utils/storage';

export const SHEETS_STORAGE_KEYS = {
  URL: 'ticktick_sheets_sync_url',
  LAST_SYNC: 'ticktick_sheets_last_sync',
  AUTO_SYNC: 'ticktick_sheets_auto_sync',
};

export const getSheetsSyncUrl = (): string | null => {
  try {
    return localStorage.getItem(SHEETS_STORAGE_KEYS.URL);
  } catch {
    return null;
  }
};

export const setSheetsSyncUrl = (url: string | null) => {
  try {
    if (url && url.trim()) {
      localStorage.setItem(SHEETS_STORAGE_KEYS.URL, url.trim());
    } else {
      localStorage.removeItem(SHEETS_STORAGE_KEYS.URL);
    }
  } catch {}
};

export const getLastSyncTime = (): string | null => {
  try {
    return localStorage.getItem(SHEETS_STORAGE_KEYS.LAST_SYNC);
  } catch {
    return null;
  }
};

export const setLastSyncTime = (timestamp: string) => {
  try {
    localStorage.setItem(SHEETS_STORAGE_KEYS.LAST_SYNC, timestamp);
  } catch {}
};

export interface SheetsSyncData {
  tasks: Task[];
  sections?: KanbanSection[];
  lists?: CustomList[];
}

export interface SheetsSyncResponse {
  status: 'success' | 'error';
  message?: string;
  tasks?: any[];
  sections?: any[];
  lists?: any[];
  tasksCount?: number;
  timestamp?: string;
}

/**
 * Test connectivity with the user's deployed Google Apps Script Web App
 */
export const testSheetsConnection = async (
  url: string
): Promise<{ success: boolean; message: string; tasksCount?: number }> => {
  try {
    const trimmed = url.trim();
    if (!trimmed.startsWith('https://script.google.com/')) {
      return {
        success: false,
        message: 'Invalid URL. It must start with https://script.google.com/macros/s/...',
      };
    }

    const response = await fetch(trimmed, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP Error ${response.status}: Failed to reach Google Apps Script. Check deployment permissions.`,
      };
    }

    const text = await response.text();
    let data: SheetsSyncResponse;
    try {
      data = JSON.parse(text);
    } catch {
      if (text.includes('ServiceLogin') || text.includes('accounts.google.com') || text.includes('<!DOCTYPE html>')) {
        return {
          success: false,
          message: 'Permission Block: Deployment "Who has access" is not set to "Anyone". Please redeploy as "Anyone".',
        };
      }
      return {
        success: false,
        message: 'Script did not return JSON. Output: ' + text.slice(0, 100),
      };
    }

    if (data.status === 'success') {
      const count = Array.isArray(data.tasks) ? data.tasks.length : 0;
      return {
        success: true,
        message: `Connected successfully! Found ${count} task(s) in Google Sheet.`,
        tasksCount: count,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Script returned an error.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message:
        err.message ||
        'Network error. Please make sure deployment access is set to "Anyone" in Google Apps Script.',
    };
  }
};

export const testWriteToSheets = async (
  url: string,
  sampleTasks: Task[]
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await pushToSheets(url, {
      tasks: sampleTasks,
      sections: [{ id: 'todo', title: 'To Do' }],
      lists: [{ id: 'welcome', name: 'Welcome', color: '#3b82f6', icon: '📋' }],
    });
    return {
      success: res.success,
      message: res.message || (res.success ? 'Tasks saved successfully to Google Sheet!' : 'Failed to write to sheet.'),
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error writing to sheet.',
    };
  }
};

/**
 * Fetch latest data from Google Sheet
 */
export const pullFromSheets = async (
  url: string
): Promise<{ tasks: Task[]; sections: KanbanSection[]; lists: CustomList[] } | null> => {
  try {
    const trimmed = url.trim();
    const response = await fetch(trimmed, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) return null;

    const data: SheetsSyncResponse = await response.json();
    if (data.status === 'success') {
      const tasks: Task[] = (data.tasks || []).map((t: any) => {
        const priority = (t.priority as any) || 'none';
        let eisenhowerQuadrant = t.eisenhowerQuadrant;
        if (!eisenhowerQuadrant || (eisenhowerQuadrant === 'q4' && priority !== 'none')) {
          eisenhowerQuadrant =
            priority === 'high' ? 'q1' : priority === 'medium' ? 'q2' : priority === 'low' ? 'q3' : 'q4';
        }

        const dueDate = normalizeDateStr(t.dueDate) || normalizeDateStr(t.assignedDate);
        const assignedDate = normalizeDateStr(t.assignedDate) || normalizeDateStr(t.dueDate) || undefined;
        const dueTime = t.dueTime ? String(t.dueTime) : (t.assignedTime ? String(t.assignedTime) : null);
        const assignedTime = t.assignedTime ? String(t.assignedTime) : (t.dueTime ? String(t.dueTime) : undefined);

        return {
          id: String(t.id),
          title: String(t.title || 'Untitled Task'),
          description: t.description ? String(t.description) : '',
          completed: Boolean(t.completed === true || t.completed === 'true' || t.completed === 'TRUE'),
          deleted: Boolean(t.deleted === true || t.deleted === 'true' || t.deleted === 'TRUE'),
          deletedAt: t.deletedAt ? String(t.deletedAt) : null,
          priority,
          dueDate,
          dueTime,
          assignedTo: t.assignedTo ? String(t.assignedTo) : undefined,
          assignedBy: t.assignedBy ? String(t.assignedBy) : undefined,
          assignedDate,
          assignedTime,
          pinned: Boolean(t.pinned === true || t.pinned === 'true' || t.pinned === 'TRUE'),
          subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
          tags: Array.isArray(t.tags) ? t.tags : [],
          kanbanStatus: t.kanbanStatus ? String(t.kanbanStatus) : 'todo',
          eisenhowerQuadrant,
          listId: t.listId ? String(t.listId) : 'welcome',
          estimatedPomodoros: Number(t.estimatedPomodoros) || 2,
          completedPomodoros: Number(t.completedPomodoros) || 0,
          createdAt: t.createdAt ? String(t.createdAt) : new Date().toISOString(),
        };
      });

      const sections: KanbanSection[] = (data.sections || []).map((s: any) => ({
        id: String(s.id),
        title: String(s.title),
      }));

      const lists: CustomList[] = (data.lists || []).map((l: any) => ({
        id: String(l.id),
        name: String(l.name),
        color: l.color ? String(l.color) : '#3b82f6',
        icon: l.icon ? String(l.icon) : '📋',
      }));

      setLastSyncTime(new Date().toISOString());
      return { tasks, sections, lists };
    }
  } catch (err) {
    console.error('Failed to pull from Google Sheets:', err);
  }
  return null;
};

/**
 * Push current tasks, sections, and lists to Google Sheet
 */
export const pushToSheets = async (
  url: string,
  data: SheetsSyncData
): Promise<{ success: boolean; message?: string; count?: number }> => {
  try {
    const trimmed = url.trim();
    // Filter out deleted tasks so they are completely eliminated from Google Sheet
    const activeTasks = (data.tasks || []).filter((t) => !t.deleted);

    // Use text/plain to avoid CORS preflight OPTIONS check on Google Apps Script
    const response = await fetch(trimmed, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'syncAll',
        tasks: activeTasks,
        sections: data.sections || [],
        lists: data.lists || [],
        clientTimestamp: new Date().toISOString(),
      }),
      redirect: 'follow',
    });

    if (!response.ok) {
      return { success: false, message: `HTTP Error ${response.status}: Failed to reach Google Script.` };
    }

    const text = await response.text();
    let resJson: SheetsSyncResponse;
    try {
      resJson = JSON.parse(text);
    } catch {
      if (text.includes('"status":"success"') || text.includes('Synced successfully')) {
        setLastSyncTime(new Date().toISOString());
        return { success: true, count: activeTasks.length };
      }
      return { success: false, message: 'Google Apps Script returned invalid response: ' + text.slice(0, 120) };
    }

    if (resJson.status === 'success') {
      setLastSyncTime(new Date().toISOString());
      return { success: true, count: resJson.tasksCount ?? activeTasks.length };
    } else {
      return { success: false, message: resJson.message || 'Script reported an error while saving.' };
    }
  } catch (err: any) {
    console.error('Failed to push to Google Sheets:', err);
    return {
      success: false,
      message: err.message || 'Network error while pushing to Google Sheet. Check access is "Anyone".',
    };
  }
};

/**
 * Merge remote and local tasks safely
 * Google Sheets is the cloud source of truth.
 * Tasks deleted in Google Sheet or on other devices are removed locally.
 * Freshly created local tasks (< 8s old) are preserved while in-flight.
 */
export const mergeTasks = (
  localTasks: Task[],
  remoteTasks: Task[],
  recentlyDeletedIds: Set<string> = new Set()
): Task[] => {
  const resultTasks: Task[] = [];
  const remoteIds = new Set<string>();

  // 1. Process all remote tasks from Google Sheet
  (remoteTasks || []).forEach((remote) => {
    // If deleted locally recently, do not resurrect
    if (recentlyDeletedIds.has(remote.id)) return;
    if (remote.deleted) return;

    remoteIds.add(remote.id);
    resultTasks.push(remote);
  });

  // 2. Check local tasks: keep only tasks that are brand new (< 8 seconds old)
  // awaiting their first push to Google Sheet
  const now = Date.now();
  (localTasks || []).forEach((local) => {
    if (recentlyDeletedIds.has(local.id)) return;
    if (local.deleted) return;
    if (remoteIds.has(local.id)) return; // Already present from remote

    // Ignore default demo tasks (w-1, etc.) once cloud remote is connected
    if (local.id.startsWith('w-')) return;

    // Check if created recently (< 8000 ms) on this device
    const createdMs = local.createdAt ? new Date(local.createdAt).getTime() : 0;
    const isRecentlyCreated = !isNaN(createdMs) && now - createdMs < 8000;
    if (isRecentlyCreated) {
      resultTasks.push(local);
    }
    // Any other local task missing from remote was deleted in Google Sheet or on another device!
  });

  return resultTasks;
};

/**
 * The exact Google Apps Script code to copy & paste into Google Sheet's script editor
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * ====================================================================
 * TickTick Clone - Google Sheets Cloud Sync Backend
 * ====================================================================
 * Step 1: Open Google Sheets -> Extensions -> Apps Script
 * Step 2: Replace all code with this file and click Save (Ctrl+S)
 * Step 3: Click 'Deploy' -> 'New deployment'
 * Step 4: Select type: 'Web app'
 * Step 5: Description: 'TickTick Sync'
 *         Execute as: 'Me'
 *         Who has access: 'Anyone' (IMPORTANT!)
 * Step 6: Click 'Deploy', Authorize access, and Copy the Web app URL.
 * Step 7: Paste that Web app URL inside your TickTick Clone App!
 * ====================================================================
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tasks = getSheetData(ss, "Tasks");
    const sections = getSheetData(ss, "Sections");
    const lists = getSheetData(ss, "Lists");
    
    return createJsonResponse({
      status: "success",
      tasks: tasks,
      sections: sections,
      lists: lists,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    const contents = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (contents.tasks && Array.isArray(contents.tasks)) {
      setSheetData(ss, "Tasks", contents.tasks, [
        "id", "title", "description", "completed", "deleted", "priority", "dueDate", "dueTime", 
        "kanbanStatus", "eisenhowerQuadrant", "assignedTo", "assignedBy", 
        "assignedDate", "assignedTime", "pinned", "subtasks", "tags", "listId", "createdAt", "deletedAt"
      ]);
    }
    
    if (contents.sections && Array.isArray(contents.sections)) {
      setSheetData(ss, "Sections", contents.sections, ["id", "title"]);
    }
    
    if (contents.lists && Array.isArray(contents.lists)) {
      setSheetData(ss, "Lists", contents.lists, ["id", "name", "color", "icon"]);
    }
    
    // Make sure changes are immediately committed to the spreadsheet
    SpreadsheetApp.flush();
    
    return createJsonResponse({
      status: "success",
      message: "Synced successfully with Google Sheet!",
      tasksCount: contents.tasks ? contents.tasks.length : 0,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  
  const headers = rows[0].map(function(h) { return String(h).trim(); });
  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    const item = {};
    headers.forEach(function(header, index) {
      let val = row[index];
      if (header === "completed" || header === "pinned" || header === "deleted") {
        item[header] = (val === true || val === "TRUE" || val === 1 || val === "true");
      } else if (header === "subtasks" || header === "tags") {
        try {
          item[header] = typeof val === "string" && val.trim() ? JSON.parse(val) : [];
        } catch (e) {
          item[header] = [];
        }
      } else if (Object.prototype.toString.call(val) === '[object Date]' || val instanceof Date) {
        const y = val.getFullYear();
        const m = String(val.getMonth() + 1).padStart(2, '0');
        const d = String(val.getDate()).padStart(2, '0');
        item[header] = y + '-' + m + '-' + d;
      } else {
        item[header] = val !== undefined && val !== null ? String(val) : "";
      }
    });
    data.push(item);
  }
  return data;
}

function setSheetData(ss, sheetName, items, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    // If setting Tasks and Sheet1 is empty, rename Sheet1 to Tasks so user sees it on first open
    const sheet1 = ss.getSheetByName("Sheet1");
    if (sheet1 && sheet1.getLastRow() <= 1 && sheetName === "Tasks") {
      sheet = sheet1.setName("Tasks");
    } else {
      sheet = ss.insertSheet(sheetName);
    }
  }
  
  // Bring Tasks tab to active focus
  if (sheetName === "Tasks") {
    try {
      ss.setActiveSheet(sheet);
    } catch(e) {}
  }
  
  sheet.clearContents();
  
  if (headers && headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#2563eb")
      .setFontColor("#ffffff");
  }
  
  if (items && items.length > 0) {
    const rows = items.map(function(item) {
      return headers.map(function(header) {
        const val = item[header];
        if (header === "subtasks" || header === "tags") {
          return val ? JSON.stringify(val) : "[]";
        }
        if (val === undefined || val === null) return "";
        return val;
      });
    });
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    try {
      sheet.autoResizeColumns(1, headers.length);
    } catch(e) {}
  }
}
`;
