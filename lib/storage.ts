import fs from 'fs';
import path from 'path';

// Server-side persistent storage
interface StorageData {
  users: Array<{ id: string; email: string; name: string; passwordHash: string }>;
  projects: Array<any>;
  tasks: Array<any>;
}

// Use in-memory cache with file backup
let data: StorageData = {
  users: [],
  projects: [],
  tasks: [],
};

const STORAGE_FILE = path.join(process.cwd(), '.data', 'storage.json');

// Initialize storage from file if it exists
function initializeStorage() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const fileContent = fs.readFileSync(STORAGE_FILE, 'utf-8');
      data = JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Error initializing storage from file:', error);
    data = { users: [], projects: [], tasks: [] };
  }
}

// Save storage to file
function persistStorage() {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error persisting storage to file:', error);
  }
}

// Initialize on module load
initializeStorage();

// For localStorage in browser / storage on server
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  // Server-side: use in-memory storage (backed by file)
  if (typeof window === 'undefined') {
    if (key === 'users') return (data.users || []) as T;
    if (key === 'projects') return (data.projects || []) as T;
    if (key === 'tasks') return (data.tasks || []) as T;
    return defaultValue;
  }
  
  // Client-side: use browser localStorage
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

export function setToLocalStorage<T>(key: string, value: T): void {
  // Server-side: save to in-memory storage and persist to file
  if (typeof window === 'undefined') {
    if (key === 'users' && Array.isArray(value)) {
      data.users = value as any;
      persistStorage();
    } else if (key === 'projects' && Array.isArray(value)) {
      data.projects = value as any;
      persistStorage();
    } else if (key === 'tasks' && Array.isArray(value)) {
      data.tasks = value as any;
      persistStorage();
    }
    return;
  }
  
  // Client-side: save to browser localStorage
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function removeFromLocalStorage(key: string): void {
  // Server-side: clear from in-memory storage and persist
  if (typeof window === 'undefined') {
    if (key === 'users') {
      data.users = [];
      persistStorage();
    } else if (key === 'projects') {
      data.projects = [];
      persistStorage();
    } else if (key === 'tasks') {
      data.tasks = [];
      persistStorage();
    }
    return;
  }
  
  // Client-side: remove from browser localStorage
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Server-side in-memory storage helpers
export function getStorageData(): StorageData {
  return data;
}

export function initializeStorageFromLocalStorage() {
  if (typeof window === 'undefined') return;
  // Initialize from localStorage if needed
}
