import { writable, get } from 'svelte/store';

// --- Constants & Keys (Sama persis dengan app.js) ---
const mockUserKey = 'gistclone:mockUser';
const mockGistsKey = 'gistclone:mockGists';
const mockUnsavedKey = 'gistclone:unsaved:';

// --- Helper Functions (Logic asli) ---
function createDefaultMockGists() {
  const sampleGistId = 'mock-gist-1';
  return {
    [sampleGistId]: {
      id: sampleGistId,
      user_id: 'mock-user-1',
      title: 'Sample Supabase-ready gist',
      description: 'This is a mock gist. Connect Supabase to persist & share it.',
      is_public: true,
      created_at: new Date().toISOString(),
      files: [
        {
          id: 'file-1',
          filename: 'hello.js',
          language: 'javascript',
          content: "console.log('Hello from the mock gist!');\n\n// Connect Supabase to persist changes.",
          created_at: new Date().toISOString()
        },
        {
          id: 'file-2',
          filename: 'README.md',
          language: 'markdown',
          content: '# Mock Gist\n\nThis gist lives only in your browser until Supabase is configured.',
          created_at: new Date().toISOString()
        }
      ]
    }
  };
}

function loadMockGistsData() {
  try {
    const stored = localStorage.getItem(mockGistsKey);
    if (!stored) {
      const defaults = createDefaultMockGists();
      localStorage.setItem(mockGistsKey, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse mock gists', e);
    const defaults = createDefaultMockGists();
    localStorage.setItem(mockGistsKey, JSON.stringify(defaults));
    return defaults;
  }
}

function loadMockUserData() {
  try {
    const stored = localStorage.getItem(mockUserKey);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

// --- Svelte Stores (State Management) ---
export const currentUser = writable(loadMockUserData());
export const gists = writable(loadMockGistsData());
export const currentGistId = writable(null);
export const currentFileId = writable(null);
export const openFileIds = writable([]);
export const saveStatus = writable('Unsaved');

// --- Actions (Logic untuk update state & localStorage) ---

// Subscribe changes to persist mock gists
gists.subscribe((value) => {
  if (value) localStorage.setItem(mockGistsKey, JSON.stringify(value));
});

// Subscribe user changes
currentUser.subscribe((value) => {
  if (!value) localStorage.removeItem(mockUserKey);
  else localStorage.setItem(mockUserKey, JSON.stringify(value));
});

export const unsavedContent = {
  get: (gistId, fileId) => localStorage.getItem(`${mockUnsavedKey}${gistId}:${fileId}`),
  set: (gistId, fileId, content) => {
    const key = `${mockUnsavedKey}${gistId}:${fileId}`;
    if (!content) localStorage.removeItem(key);
    else localStorage.setItem(key, content);
  },
  remove: (gistId, fileId) => localStorage.removeItem(`${mockUnsavedKey}${gistId}:${fileId}`)
};

// UUID Helper
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}