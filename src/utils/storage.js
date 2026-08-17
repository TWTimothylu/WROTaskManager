import { DEFAULT_WRO_TEMPLATE } from './defaultTemplate.js';

const STORAGE_KEY_TEMPLATES = 'wro_templates_v1';
const STORAGE_KEY_ACTIVE_STATE = 'wro_active_state_v1';

export function loadSavedTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (!raw) {
      const initial = [DEFAULT_WRO_TEMPLATE];
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load templates from localStorage:', e);
    return [DEFAULT_WRO_TEMPLATE];
  }
}

export function saveTemplate(template) {
  try {
    const list = loadSavedTemplates();
    const existingIndex = list.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...template, id: template.id || `template-${Date.now()}` });
    }
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(list));
    return list;
  } catch (e) {
    console.error('Failed to save template:', e);
    return [];
  }
}

export function deleteTemplate(templateId) {
  try {
    let list = loadSavedTemplates();
    list = list.filter(t => t.id !== templateId);
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(list));
    return list;
  } catch (e) {
    console.error('Failed to delete template:', e);
    return [];
  }
}

export function exportTemplateAsJSON(template) {
  const jsonStr = JSON.stringify(template, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.name.replace(/\s+/g, '_')}_wro_template.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function saveActiveSessionState(state) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_STATE, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save active session state:', e);
  }
}

export function loadActiveSessionState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_STATE);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearActiveSessionState() {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_STATE);
  } catch (e) {
    console.error('Failed to clear active session state:', e);
  }
}

