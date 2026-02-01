
import { Note, Folder } from '../types';

const STORAGE_KEY = 'zennote_db';

interface DB {
  folders: Folder[];
  notes: Note[];
}

const INITIAL_DB: DB = {
  folders: [],
  notes: [],
};

export class DatabaseService {
  private static getDB(): DB {
    const data = localStorage.getItem(STORAGE_KEY);
    const db = data ? JSON.parse(data) : INITIAL_DB;
    // Ensure structure is always correct
    if (!db.folders) db.folders = [];
    if (!db.notes) db.notes = [];
    return db;
  }

  private static saveDB(db: DB) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  static async getFolders(): Promise<Folder[]> {
    return this.getDB().folders;
  }

  static async createFolder(name: string, parentId: string | null): Promise<Folder> {
    const db = this.getDB();
    const newFolder: Folder = { id: `f-${Date.now()}`, name, parentId, isOpen: true };
    db.folders.push(newFolder);
    this.saveDB(db);
    return newFolder;
  }

  static async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    const db = this.getDB();
    db.folders = db.folders.map(f => f.id === id ? { ...f, ...updates } : f);
    this.saveDB(db);
    return db.folders.find(f => f.id === id)!;
  }

  static async deleteFolder(id: string): Promise<void> {
    const db = this.getDB();
    const itemsToDelete = new Set([id]);
    const findChildren = (parentId: string) => {
      db.folders.forEach(f => {
        if (f.parentId === parentId) {
          itemsToDelete.add(f.id);
          findChildren(f.id);
        }
      });
    };
    findChildren(id);

    db.folders = db.folders.filter(f => !itemsToDelete.has(f.id));
    db.notes = db.notes.filter(n => !n.folderId || !itemsToDelete.has(n.folderId));
    this.saveDB(db);
  }

  static async getNotes(): Promise<Note[]> {
    return this.getDB().notes;
  }

  static async createNote(title: string, folderId: string | null): Promise<Note> {
    const db = this.getDB();
    const newNote: Note = {
      id: `n-${Date.now()}`,
      title,
      content: '',
      folderId,
      updatedAt: Date.now(),
    };
    db.notes.push(newNote);
    this.saveDB(db);
    return newNote;
  }

  static async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const db = this.getDB();
    db.notes = db.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n);
    this.saveDB(db);
    return db.notes.find(n => n.id === id)!;
  }

  static async deleteNote(id: string): Promise<void> {
    const db = this.getDB();
    db.notes = db.notes.filter(n => n.id !== id);
    this.saveDB(db);
  }
}
