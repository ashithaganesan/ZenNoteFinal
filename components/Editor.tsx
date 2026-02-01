
import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import Toolbar from './Toolbar';
import { GeminiService } from '../services/gemini';

interface EditorProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

const PEN_COLORS = [
  { name: 'Black', value: '#1e293b' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
];

const Editor: React.FC<EditorProps> = ({ note, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(note.title);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState(PEN_COLORS[1].value); // default Indigo
  const [isEraser, setIsEraser] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawingRef = useRef(false);
  const lastNoteIdRef = useRef<string | null>(null);

  // Sync state only when switching notes to avoid cursor jumping
  useEffect(() => {
    if (lastNoteIdRef.current !== note.id) {
        setTitle(note.title);
        if (contentRef.current) {
            contentRef.current.innerHTML = note.content;
        }
        lastNoteIdRef.current = note.id;
    }
  }, [note.id, note.title, note.content]);

  const handleAutoSave = (updatedTitle: string) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      const currentContent = contentRef.current?.innerHTML || '';
      onUpdate(note.id, { title: updatedTitle, content: currentContent });
      setIsSaving(false);
    }, 1200); // Slightly longer delay for smoother typing
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    handleAutoSave(e.target.value);
  };

  const handleInput = () => {
    handleAutoSave(title);
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (contentRef.current) contentRef.current.focus();
    handleInput();
  };

  const handleSummarize = async () => {
    setIsProcessingAI(true);
    const currentText = contentRef.current?.innerText || '';
    const summary = await GeminiService.summarizeNote(currentText);
    const htmlSummary = `<br/><br/><div style="background: #f8fafc; padding: 16px; border-radius: 12px; border-left: 5px solid #6366f1; margin: 10px 0; font-style: italic;"><strong>AI Summary:</strong><br/>${summary}</div><br/>`;
    
    if (contentRef.current) {
        contentRef.current.innerHTML += htmlSummary;
    }
    handleInput();
    setIsProcessingAI(false);
  };

  const handleExpand = async () => {
    setIsProcessingAI(true);
    const currentText = contentRef.current?.innerText || '';
    const expansion = await GeminiService.expandNote(currentText);
    const htmlExpansion = `<br/><br/><div style="background: #fdf2f8; padding: 16px; border-radius: 12px; border-left: 5px solid #db2777; margin: 10px 0;"><strong>AI Deep Dive:</strong><br/>${expansion}</div><br/>`;
    
    if (contentRef.current) {
        contentRef.current.innerHTML += htmlExpansion;
    }
    handleInput();
    setIsProcessingAI(false);
  };

  // --- Drawing Logic ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    let x: number, y: number;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    drawingRef.current = true;
    draw(e);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    ctx.lineWidth = isEraser ? 24 : 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const saveDrawing = () => {
    if (!canvasRef.current || !contentRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    const img = `<img src="${dataUrl}" style="max-width: 100%; border-radius: 12px; margin: 20px 0; border: 2px solid #e2e8f0; display: block;" />`;
    contentRef.current.innerHTML += img;
    
    const ctx = canvasRef.current.getContext('2d');
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    setIsDrawing(false);
    handleInput();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      <Toolbar 
        onSummarize={handleSummarize} 
        onExpand={handleExpand} 
        onDelete={() => onDelete(note.id)} 
        onFormat={handleFormat}
        onToggleDrawing={() => setIsDrawing(!isDrawing)}
        isDrawing={isDrawing}
        isSaving={isSaving}
        isProcessing={isProcessingAI}
      />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-50/30">
        <div className="max-w-4xl mx-auto py-16 px-8 lg:px-24 min-h-full flex flex-col">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="New Page Name..."
            className="w-full text-5xl font-black text-slate-800 placeholder-slate-200 border-none outline-none mb-10 bg-transparent tracking-tight"
          />
          
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            className="flex-1 w-full min-h-[700px] text-xl text-slate-700 outline-none leading-relaxed prose prose-indigo max-w-none prose-p:my-2 prose-headings:text-slate-900 focus:ring-0"
            onInput={handleInput}
            spellCheck="true"
          />
        </div>

        {/* Draw Overlay Modal */}
        {isDrawing && (
            <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 w-full max-w-4xl h-[600px] animate-in fade-in zoom-in duration-200">
                    <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </div>
                                <span className="font-black text-slate-800 tracking-tight">Handwriting Tool</span>
                            </div>
                            <div className="flex space-x-3">
                                 <button 
                                    onClick={() => setIsDrawing(false)}
                                    className="px-5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={saveDrawing}
                                    className="px-6 py-2 text-sm font-black bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                >
                                    Insert Sketch
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pen</span>
                            <div className="flex items-center gap-1.5">
                                {PEN_COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => { setPenColor(c.value); setIsEraser(false); }}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${isEraser ? 'border-transparent opacity-50' : penColor === c.value ? 'border-slate-800 ring-2 ring-offset-2 ring-slate-400 scale-110' : 'border-slate-200 hover:border-slate-300'}`}
                                        style={{ backgroundColor: c.value }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <button
                                type="button"
                                onClick={() => setIsEraser(!isEraser)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${isEraser ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                title="Eraser"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Eraser
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#fafafa] overflow-hidden relative cursor-crosshair">
                        <canvas 
                            ref={canvasRef}
                            width={1200}
                            height={800}
                            className="w-full h-full"
                            onMouseDown={startDrawing}
                            onMouseUp={stopDrawing}
                            onMouseMove={draw}
                            onTouchStart={startDrawing}
                            onTouchEnd={stopDrawing}
                            onTouchMove={draw}
                        />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
