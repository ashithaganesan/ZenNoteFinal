
import React, { useState, useRef, useEffect } from 'react';
import { Folder, Note } from '../types';

interface TreeNodeProps {
  folder: Folder;
  allFolders: Folder[];
  allNotes: Note[];
  depth: number;
  selectedId: string | null;
  onSelectFolder: (id: string) => void;
  onSelectNote: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onAddNote: (folderId: string) => void;
  onAddFolder: (parentId: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onRenameNote: (id: string, newTitle: string) => void;
  onDeleteNote: (id: string) => void;
  onMoveNote: (noteId: string, targetFolderId: string | null) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  folder,
  allFolders,
  allNotes,
  depth,
  selectedId,
  onSelectFolder,
  onSelectNote,
  onToggleFolder,
  onAddNote,
  onAddFolder,
  onDeleteFolder,
  onRenameFolder,
  onRenameNote,
  onDeleteNote,
  onMoveNote
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const childFolders = allFolders.filter(f => f.parentId === folder.id);
  const childNotes = allNotes.filter(n => n.folderId === folder.id);
  const isSelected = selectedId === folder.id;

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStartEdit = (id: string, initialValue: string) => {
    setEditingId(id);
    setEditValue(initialValue);
  };

  const handleSaveEdit = (id: string, isFolder: boolean) => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    if (isFolder) {
      onRenameFolder(id, editValue);
    } else {
      onRenameNote(id, editValue);
    }
    setEditingId(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const noteId = e.dataTransfer.getData('text/plain');
    if (noteId && /^n-\d+$/.test(noteId)) {
      onMoveNote(noteId, folder.id);
    }
  };

  return (
    <div className="select-none mb-0.5">
      <div 
        className={`group flex items-center py-1.5 px-2 rounded-lg cursor-pointer transition-all ${
          isSelected ? 'bg-indigo-600 text-white shadow-md' : 
          isDragOver ? 'bg-indigo-100 ring-2 ring-indigo-400 text-indigo-700' :
          'hover:bg-slate-200 text-slate-700'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
            onSelectFolder(folder.id);
            onToggleFolder(folder.id);
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <span className="mr-2 opacity-70 flex-shrink-0">
          {folder.isOpen ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          )}
        </span>
        <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${isSelected ? 'text-white' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
        
        {editingId === folder.id ? (
          <input
            ref={inputRef}
            className="flex-1 bg-white text-slate-900 text-sm font-semibold px-1 rounded outline-none ring-2 ring-indigo-400"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(folder.id, true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit(folder.id, true);
              if (e.key === 'Escape') setEditingId(null);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate text-sm font-semibold">{folder.name}</span>
        )}
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddNote(folder.id); }} className="p-1 hover:bg-black/10 rounded" title="New Note">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAddFolder(folder.id); }} className="p-1 hover:bg-black/10 rounded" title="New Subfolder">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v4m2-2h-4" /></svg>
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleStartEdit(folder.id, folder.name); }} className="p-1 hover:bg-black/10 rounded" title="Rename Folder">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} className="p-1 hover:bg-red-500/20 text-red-500 rounded" title="Delete Folder">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
      </div>

      {folder.isOpen && (
        <div className="mt-1 border-l border-slate-300 ml-4">
          {childFolders.map(child => (
            <TreeNode 
              key={child.id}
              folder={child}
              allFolders={allFolders}
              allNotes={allNotes}
              depth={depth + 1}
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
          {childNotes.map(note => (
            <div
              key={note.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', note.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              className={`group flex items-center py-1.5 px-3 mx-1 rounded-lg cursor-grab active:cursor-grabbing transition-all ${selectedId === note.id ? 'bg-white shadow-md text-indigo-700 ring-1 ring-indigo-200' : 'hover:bg-indigo-50 text-slate-600'}`}
              onClick={() => onSelectNote(note.id)}
            >
              <svg className="w-3.5 h-3.5 mr-2 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              
              {editingId === note.id ? (
                <input
                  ref={inputRef}
                  className="flex-1 bg-white text-slate-900 text-xs font-semibold px-1 rounded outline-none ring-1 ring-indigo-400"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleSaveEdit(note.id, false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(note.id, false);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 truncate text-xs font-medium">{note.title || 'Untitled'}</span>
              )}
              
              <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button onClick={(e) => { e.stopPropagation(); handleStartEdit(note.id, note.title); }} className="p-1 hover:bg-slate-200 rounded" title="Rename Note">
                      <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }} className="p-1 hover:bg-red-100 text-red-500 rounded" title="Delete Note">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
