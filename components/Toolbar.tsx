
import React from 'react';

interface ToolbarProps {
  onSummarize: () => void;
  onExpand: () => void;
  onDelete: () => void;
  onFormat: (command: string, value?: string) => void;
  onToggleDrawing: () => void;
  isDrawing: boolean;
  isSaving: boolean;
  isProcessing: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onSummarize, 
  onExpand, 
  onDelete, 
  onFormat, 
  onToggleDrawing,
  isDrawing,
  isSaving, 
  isProcessing 
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
      <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
        {/* AI Tools */}
        <button 
            className="p-1.5 rounded hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors"
            onClick={onSummarize}
            disabled={isProcessing}
            title="Summarize with AI"
        >
          <svg className={`w-5 h-5 ${isProcessing ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
        <button 
            className="p-1.5 rounded hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors"
            onClick={onExpand}
            disabled={isProcessing}
            title="Expand with AI"
        >
          <svg className={`w-5 h-5 ${isProcessing ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </button>
        
        <div className="w-[1px] h-4 bg-slate-200 mx-2"></div>

        {/* Font Selectors */}
        <select 
            className="text-xs border-none bg-slate-100 rounded px-1 py-1 focus:ring-0 cursor-pointer outline-none"
            onChange={(e) => onFormat('fontName', e.target.value)}
        >
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Monospace</option>
        </select>

        <select 
            className="text-xs border-none bg-slate-100 rounded px-1 py-1 focus:ring-0 cursor-pointer outline-none w-14"
            onChange={(e) => onFormat('fontSize', e.target.value)}
        >
            <option value="3">Med</option>
            <option value="1">Small</option>
            <option value="5">Large</option>
            <option value="7">Huge</option>
        </select>

        <div className="w-[1px] h-4 bg-slate-200 mx-2"></div>

        {/* Formatting */}
        <button onClick={() => onFormat('bold')} className="p-1.5 rounded hover:bg-slate-100 font-bold text-slate-700" title="Bold">B</button>
        <button onClick={() => onFormat('italic')} className="p-1.5 rounded hover:bg-slate-100 italic text-slate-700" title="Italic">I</button>
        <button onClick={() => onFormat('underline')} className="p-1.5 rounded hover:bg-slate-100 underline text-slate-700" title="Underline">U</button>
        
        <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
        
        <button onClick={() => onFormat('superscript')} className="p-1.5 rounded hover:bg-slate-100 text-xs text-slate-700" title="Superscript">X<sup>2</sup></button>
        <button onClick={() => onFormat('subscript')} className="p-1.5 rounded hover:bg-slate-100 text-xs text-slate-700" title="Subscript">X<sub>2</sub></button>

        <div className="w-[1px] h-4 bg-slate-200 mx-2"></div>

        {/* Drawing Mode */}
        <button 
            onClick={onToggleDrawing}
            className={`p-1.5 rounded transition-colors ${isDrawing ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            title="Sketch Pad"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
      </div>

      <div className="flex items-center space-x-4 ml-2">
        <div className="hidden sm:block">
            {isSaving ? (
                <div className="flex items-center text-[10px] text-slate-400 font-medium">
                    <svg className="animate-spin h-3 w-3 mr-1 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Auto-saving
                </div>
            ) : (
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Saved</span>
            )}
        </div>
        <button 
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            title="Delete Note"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
