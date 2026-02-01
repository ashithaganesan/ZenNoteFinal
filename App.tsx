
import React, { useState, useEffect, useCallback } from 'react';
import { Note, Folder } from './types';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { DatabaseService } from './services/database';

const App: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [f, n] = await Promise.all([
        DatabaseService.getFolders(),
        DatabaseService.getNotes()
      ]);
      setFolders(f || []);
      setNotes(n || []);
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectNote = (id: string) => setSelectedNoteId(id);
  const handleSelectFolder = (id: string) => setSelectedNoteId(null);

  const handleToggleFolder = async (id: string) => {
    const folder = folders.find(f => f.id === id);
    if (!folder) return;
    const updated = await DatabaseService.updateFolder(id, { isOpen: !folder.isOpen });
    setFolders(prev => prev.map(f => f.id === id ? updated : f));
  };

  const handleAddFolder = async (parentId: string | null) => {
    const newFolder = await DatabaseService.createFolder("New Folder", parentId);
    setFolders(prev => {
      // Idempotent: React 18 Strict Mode double-invokes updaters in dev; avoid adding twice
      if (prev.some(f => f.id === newFolder.id)) return prev;
      const next = [...prev, newFolder];
      // Auto-open parent so the new subfolder is visible
      if (parentId) {
        return next.map(f => f.id === parentId && !f.isOpen ? { ...f, isOpen: true } : f);
      }
      return next;
    });
    if (parentId) {
      const parent = folders.find(f => f.id === parentId);
      if (parent && !parent.isOpen) {
        await DatabaseService.updateFolder(parentId, { isOpen: true });
      }
    }
  };

  const handleRenameFolder = async (id: string, newName: string) => {
    const updated = await DatabaseService.updateFolder(id, { name: newName });
    setFolders(prev => prev.map(f => f.id === id ? updated : f));
  };

  const handleRenameNote = async (id: string, newTitle: string) => {
    const updated = await DatabaseService.updateNote(id, { title: newTitle });
    setNotes(prev => prev.map(n => n.id === id ? updated : n));
  };

  const handleAddNote = async (folderId: string | null) => {
    const newNote = await DatabaseService.createNote("Untitled Page", folderId);
    setNotes(prev => {
      if (prev.some(n => n.id === newNote.id)) return prev;
      return [...prev, newNote];
    });
    setSelectedNoteId(newNote.id);
    
    // Auto open parent folder if adding note inside it
    if (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder && !folder.isOpen) {
        handleToggleFolder(folderId);
      }
    }
  };

  const handleMoveNote = async (noteId: string, targetFolderId: string | null) => {
    const updated = await DatabaseService.updateNote(noteId, { folderId: targetFolderId });
    setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
    
    // Open the folder we dropped into
    if (targetFolderId) {
      const folder = folders.find(f => f.id === targetFolderId);
      if (folder && !folder.isOpen) {
        handleToggleFolder(targetFolderId);
      }
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Delete folder? This will permanently remove all files inside.")) return;
    await DatabaseService.deleteFolder(id);
    fetchData();
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    const updated = await DatabaseService.updateNote(id, updates);
    setNotes(prev => prev.map(n => n.id === id ? updated : n));
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    await DatabaseService.deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black tracking-widest text-[11px] uppercase">Booting ZenNote</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden text-slate-900 bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar 
        folders={folders}
        notes={notes}
        selectedId={selectedNoteId}
        onSelectFolder={handleSelectFolder}
        onSelectNote={handleSelectNote}
        onToggleFolder={handleToggleFolder}
        onAddFolder={handleAddFolder}
        onAddNote={handleAddNote}
        onDeleteFolder={handleDeleteFolder}
        onRenameFolder={handleRenameFolder}
        onRenameNote={handleRenameNote}
        onDeleteNote={handleDeleteNote}
        onMoveNote={handleMoveNote}
      />
      
      <main className="flex-1 relative overflow-hidden bg-slate-50">
        {selectedNote ? (
          <Editor 
            key={selectedNote.id}
            note={selectedNote} 
            onUpdate={handleUpdateNote} 
            onDelete={handleDeleteNote}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2rem] shadow-2xl shadow-indigo-200 flex items-center justify-center mb-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">Master Your Ideas.</h2>
            <p className="text-slate-400 mt-6 max-w-sm text-lg font-medium leading-relaxed">Capture thoughts, organize folders, and use AI to expand your knowledge base.</p>
            <div className="mt-12 flex space-x-4">
                <button 
                    onClick={() => handleAddNote(null)}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95"
                >
                    Create a Quick Note
                </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
