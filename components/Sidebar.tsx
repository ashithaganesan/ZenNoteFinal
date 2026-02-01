
import React, { useState, useRef, useEffect } from 'react';
import { Folder, Note } from '../types';
import TreeNode from './TreeNode';

interface SidebarProps {
  folders: Folder[];
  notes: Note[];
  selectedId: string | null;
  onSelectFolder: (id: string) => void;
  onSelectNote: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onAddFolder: (parentId: string | null) => void;
  onAddNote: (folderId: string | null) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onRenameNote: (id: string, newTitle: string) => void;
  onDeleteNote: (id: string) => void;
  onMoveNote: (noteId: string, targetFolderId: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  folders,
  notes,
  selectedId,
  onSelectFolder,
  onSelectNote,
  onToggleFolder,
  onAddFolder,
  onAddNote,
  onDeleteFolder,
  onRenameFolder,
  onRenameNote,
  onDeleteNote,
  onMoveNote
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const rootFolders = folders.filter(f => !f.parentId);
  const orphanNotes = notes.filter(n => !n.folderId);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartEdit = (id: string, initialValue: string) => {
    setEditingId(id);
    setEditValue(initialValue);
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    onRenameNote(id, editValue);
    setEditingId(null);
  };

  const onDragOverRoot = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Use text/plain - custom types often fail in Chrome/Safari
    if (e.dataTransfer.types.includes('text/plain')) setIsDragOverRoot(true);
  };

  const onDragLeaveRoot = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOverRoot(false);
  };

  const onDropRoot = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverRoot(false);
    const noteId = e.dataTransfer.getData('text/plain');
    if (noteId && /^n-\d+$/.test(noteId)) {
      onMoveNote(noteId, null);
    }
  };

  return (
    <div className="w-72 h-full bg-slate-100 border-r border-slate-200 flex flex-col">
      <div className="p-5 border-b border-slate-200 bg-white/50 backdrop-blur-md">
        <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <span className="text-white font-black text-xl">Z</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-slate-800">ZenNote</h1>
        </div>
        
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Search notes..." 
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div 
        className={`flex-1 overflow-y-auto custom-scrollbar px-3 py-4 transition-colors ${isDragOverRoot ? 'bg-indigo-50 ring-2 ring-indigo-200 ring-inset rounded-lg' : ''}`}
        onDragOver={onDragOverRoot}
        onDragLeave={onDragLeaveRoot}
        onDrop={onDropRoot}
      >
        {searchTerm ? (
          <div className="space-y-1">
            <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Search Results</p>
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all ${selectedId === note.id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
                onClick={() => onSelectNote(note.id)}
              >
                <svg className="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="flex-1 truncate text-sm font-medium">{note.title || 'Untitled'}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace</span>
                <div className="flex space-x-1">
                  <button type="button" onClick={() => onAddFolder(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors" title="New Folder">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </button>
                  <button type="button" onClick={() => onAddNote(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors" title="New Root Note">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                  </button>
                </div>
            </div>
            
            {/* Folder Tree */}
            {rootFolders.map(folder => (
              <TreeNode 
                key={folder.id} 
                folder={folder} 
                allFolders={folders} 
                allNotes={notes} 
                depth={0} 
                selectedId={selectedId}
                onSelectFolder={onSelectFolder}
                onSelectNote={onSelectNote}
                onToggleFolder={onToggleFolder}
                onAddNote={onAddNote}
                onAddFolder={onAddFolder}
                onDeleteFolder={onDeleteFolder}
                onRenameFolder={onRenameFolder}
                onRenameNote={onRenameNote}
                onDeleteNote={onDeleteNote}
                onMoveNote={onMoveNote}
              />
            ))}
            
            {/* Notes without folders */}
            {orphanNotes.length > 0 && <div className="pt-4 pb-1 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">General Notes</div>}
            {orphanNotes.map(note => (
                <div
                    key={note.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', note.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className={`group flex items-center py-2 px-3 rounded-lg cursor-grab active:cursor-grabbing transition-all ${selectedId === note.id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-indigo-50 text-slate-600'}`}
                    onClick={() => onSelectNote(note.id)}
                >
                    <svg className="w-4 h-4 mr-2 opacity-70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    
                    {editingId === note.id ? (
                      <input
                        ref={inputRef}
                        className="flex-1 bg-white text-slate-900 text-sm font-semibold px-1 rounded outline-none ring-1 ring-indigo-400"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveEdit(note.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(note.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="flex-1 truncate text-sm font-semibold">{note.title || 'Untitled'}</span>
                    )}

                    <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button onClick={(e) => { e.stopPropagation(); handleStartEdit(note.id, note.title); }} className={`p-1 rounded ${selectedId === note.id ? 'hover:bg-white/20' : 'hover:bg-indigo-100'}`} title="Rename">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }} className={`p-1 rounded ${selectedId === note.id ? 'hover:bg-white/20' : 'hover:bg-red-100 text-red-500'}`} title="Delete">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
