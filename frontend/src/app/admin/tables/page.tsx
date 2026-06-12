"use client";

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Plus, 
  Trash2, 
  Circle, 
  Square, 
  Minus,
  Save,
  MousePointer2,
  X,
  Download,
  PenTool,
  Edit2
} from 'lucide-react';

// --- Types ---
type ElementType = 'table-round' | 'table-square' | 'wall';

interface FloorElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  seats: number;
  isTable: boolean; // Added flag to distinguish interactive tables from decor/structural elements
}

interface FloorPlanData {
  _id: string;
  name: string;
  elements: FloorElement[];
}

export default function AdminFloorPlanPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // App States
  const [mode, setMode] = useState<'edit' | 'view'>('view');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Floor Plan Data State
  const [floors, setFloors] = useState<FloorPlanData[]>([]);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);

  const activeFloor = floors.find(f => f._id === activeFloorId);
  const elements = activeFloor?.elements || [];

  const updateActiveElements = (updater: FloorElement[] | ((prev: FloorElement[]) => FloorElement[])) => {
    setFloors(prev => prev.map(f => {
      if (f._id === activeFloorId) {
        const newElements = typeof updater === 'function' ? updater(f.elements) : updater;
        return { ...f, elements: newElements };
      }
      return f;
    }));
  };

  // Load from database on mount
  useEffect(() => {
    const fetchFloorPlan = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/floorplan');
        if (res.ok) {
          const data: FloorPlanData[] = await res.json();
          if (data && data.length > 0) {
            setFloors(data);
            setActiveFloorId(data[0]._id);
          } else {
            // Create a default floor
            const createRes = await fetch('http://localhost:5000/api/floorplan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: 'Main Floor', elements: [] })
            });
            if (createRes.ok) {
              const newFloor = await createRes.json();
              setFloors([newFloor]);
              setActiveFloorId(newFloor._id);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch floor plan from database", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFloorPlan();
  }, []);
  
  // Interaction States
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // View Mode / Drawer States
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [viewTable, setViewTable] = useState<FloorElement | null>(null);

  const openDrawer = (table: FloorElement) => {
    setViewTable(table);
    setIsDrawerMounted(true);
    setTimeout(() => setIsDrawerVisible(true), 10);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerMounted(false);
      setViewTable(null);
    }, 300);
  };

  // Prevent background scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isDrawerVisible ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isDrawerVisible]);

  // --- Interaction Logic (Drag & Resize) ---
  const handlePointerDown = (e: React.PointerEvent, el: FloorElement) => {
    e.stopPropagation(); 
    
    if (mode === 'view') {
      // Only open QR drawer if it is explicitly marked as a table
      if (el.isTable) {
        openDrawer(el);
      }
      return;
    }

    (e.target as Element).setPointerCapture(e.pointerId);
    setSelectedId(el.id);
    setDraggingId(el.id);
    
    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      setDragOffset({
        x: (e.clientX - svgRect.left) - el.x,
        y: (e.clientY - svgRect.top) - el.y
      });
    }
  };

  const handleResizeDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation(); 
    if (mode === 'view') return;
    
    (e.target as Element).setPointerCapture(e.pointerId);
    setResizingId(id);
    setSelectedId(id); 
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;
    
    if (resizingId) {
      updateActiveElements(prev => prev.map(el => {
        if (el.id === resizingId) {
          let newWidth = mouseX - el.x;
          let newHeight = mouseY - el.y;

          // Snap resizing to 20px grid, enforce minimum size based on type
          const minSize = el.type === 'wall' ? 20 : 40;
          newWidth = Math.max(minSize, Math.round(newWidth / 20) * 20);
          newHeight = Math.max(minSize, Math.round(newHeight / 20) * 20);

          // Keep round tables perfectly circular
          if (el.type === 'table-round') {
            const size = Math.max(newWidth, newHeight);
            return { ...el, width: size, height: size };
          }
          return { ...el, width: newWidth, height: newHeight };
        }
        return el;
      }));
    } else if (draggingId) {
      updateActiveElements(prev => prev.map(el => {
        if (el.id === draggingId) {
          let newX = mouseX - dragOffset.x;
          let newY = mouseY - dragOffset.y;
          
          // Snap dragging to 20px grid
          newX = Math.round(newX / 20) * 20;
          newY = Math.round(newY / 20) * 20;
          
          return { ...el, x: newX, y: newY };
        }
        return el;
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId || resizingId) {
      try { (e.target as Element).releasePointerCapture(e.pointerId); } catch(e) {}
      setDraggingId(null);
      setResizingId(null);
    }
  };

  const handleCanvasPointerDown = () => {
    if (mode === 'edit') {
      setSelectedId(null);
    }
  };

  // --- Toolbar Actions ---
  const addElement = (type: ElementType, defaultLabel: string, w: number, h: number, seats: number, isTable: boolean = true) => {
    const newEl: FloorElement = {
      id: Date.now().toString(),
      type,
      x: 100, y: 100, width: w, height: h, label: defaultLabel, seats, isTable
    };
    updateActiveElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateSelected = (updates: Partial<FloorElement>) => {
    updateActiveElements(prev => prev.map(el => el.id === selectedId ? { ...el, ...updates } : el));
  };

  const deleteSelected = () => {
    updateActiveElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  const handleAddFloor = async () => {
    const name = prompt("Enter new floor name:");
    if (!name) return;
    try {
      const res = await fetch('http://localhost:5000/api/floorplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, elements: [] })
      });
      if (res.ok) {
        const newFloor = await res.json();
        setFloors([...floors, newFloor]);
        setActiveFloorId(newFloor._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenameFloor = async () => {
    if (!activeFloorId) return;
    const currentName = activeFloor?.name || '';
    const newName = prompt("Enter new name for this floor:", currentName);
    if (!newName || newName === currentName) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/floorplan/${activeFloorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }) // only update name
      });
      if (res.ok) {
        setFloors(floors.map(f => f._id === activeFloorId ? { ...f, name: newName } : f));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFloor = async () => {
    if (!activeFloorId) return;
    if (floors.length === 1) {
      alert("You must have at least one floor plan.");
      return;
    }
    if (!confirm(`Are you sure you want to delete "${activeFloor?.name}"? All tables on it will also be deleted from the system.`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/floorplan/${activeFloorId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updatedFloors = floors.filter(f => f._id !== activeFloorId);
        setFloors(updatedFloors);
        setActiveFloorId(updatedFloors[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMode = async () => {
    if (mode === 'edit') {
      setIsSaving(true);
      setSelectedId(null); // Clear selection visually before saving
      
      try {
        if (activeFloorId) {
          await fetch(`http://localhost:5000/api/floorplan/${activeFloorId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elements }),
          });
        }
      } catch (e) {
        console.error("Failed to save floor plan to database", e);
      }
      
      setTimeout(() => {
        setIsSaving(false);
        setMode('view');
      }, 600);
    } else {
      setMode('edit');
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);
  const isEdit = mode === 'edit';

  return (
    <div className="h-full flex flex-col relative max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Floor Plan</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isEdit ? "Design your layout. Drag to move, pull corners to resize." : "Live floor plan. Click a table to view its QR code."}
          </p>
        </div>
        <button 
          onClick={toggleMode}
          disabled={isSaving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70 cursor-pointer ${
            isEdit 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
              : 'bg-zinc-900 hover:bg-zinc-800 text-white'
          }`}
        >
          {isSaving ? 'Saving...' : isEdit ? <><Save size={16} /> Save & View</> : <><PenTool size={16} /> Edit Layout</>}
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        
        {/* Floor Tabs */}
        {!isLoading && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 border-b border-zinc-100 mb-2">
            {floors.map(floor => (
              <button
                key={floor._id}
                onClick={() => setActiveFloorId(floor._id)}
                className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  activeFloorId === floor._id 
                    ? 'bg-zinc-900 text-white' 
                    : 'bg-white border-x border-t border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {floor.name}
              </button>
            ))}
            {isEdit && (
              <>
                <button
                  onClick={handleAddFloor}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-dashed border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ml-2"
                >
                  <Plus size={16} /> Add Floor
                </button>
                {activeFloorId && (
                  <button
                    onClick={handleRenameFloor}
                    className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 size={16} /> Rename Floor
                  </button>
                )}
                {activeFloorId && floors.length > 1 && (
                  <button
                    onClick={handleDeleteFloor}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer border border-red-100 bg-red-50/50"
                  >
                    <Trash2 size={16} /> Delete Floor
                  </button>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Left Toolbar (Only visible in Edit Mode) */}
        {isEdit && (
          <div className="w-56 flex flex-col gap-3 shrink-0 overflow-y-auto pb-4 animate-in slide-in-from-left-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Add Elements</h3>
            
            <ToolButton icon={<Circle size={18} />} label="Round Table" onClick={() => addElement('table-round', 'T', 80, 80, 4, true)} />
            <ToolButton icon={<Square size={18} />} label="Square Table" onClick={() => addElement('table-square', 'T', 100, 100, 4, true)} />
            <ToolButton icon={<Minus size={18} className="rotate-90" />} label="Vertical Wall" onClick={() => addElement('wall', '', 20, 200, 0, false)} />
            <ToolButton icon={<Minus size={18} />} label="Horizontal Wall" onClick={() => addElement('wall', '', 200, 20, 0, false)} />
            
            {/* Properties Panel */}
            <div className={`mt-6 transition-opacity duration-200 ${selectedElement ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 border-t border-zinc-200 pt-6">Properties</h3>
              {selectedElement && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-4">
                  
                  {/* Is Table Toggle */}
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer uppercase tracking-wide">
                    <input 
                      type="checkbox" 
                      checked={selectedElement.isTable}
                      onChange={(e) => updateSelected({ isTable: e.target.checked })}
                      className="accent-zinc-900 w-4 h-4 rounded-sm cursor-pointer"
                    />
                    Is Bookable Table
                  </label>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Identifier / Label</label>
                    <input 
                      type="text" 
                      value={selectedElement.label}
                      onChange={(e) => updateSelected({ label: e.target.value })}
                      placeholder="e.g. 12, Bar, Stage"
                      className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm font-bold text-zinc-900 focus:border-zinc-900 outline-none"
                    />
                  </div>
                  
                  {selectedElement.isTable && (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Seats</label>
                      <input 
                        type="number" 
                        value={selectedElement.seats}
                        onChange={(e) => updateSelected({ seats: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm font-bold text-zinc-900 focus:border-zinc-900 outline-none"
                      />
                    </div>
                  )}
                  
                  <hr className="border-zinc-200" />
                  <button 
                    onClick={deleteSelected}
                    className="w-full flex items-center justify-center gap-2 border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} /> Remove Element
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* The Interactive Canvas */}
        <div 
          className={`flex-1 bg-white border rounded-xl overflow-hidden relative touch-none transition-colors duration-500 ${
            isEdit ? 'border-zinc-200 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]' : 'border-zinc-100 shadow-sm'
          }`}
          onPointerDown={handleCanvasPointerDown}
        >
          {isEdit && !selectedId && (
            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm border border-zinc-200 text-zinc-500 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 pointer-events-none z-10 animate-in fade-in zoom-in duration-300">
              <MousePointer2 size={14} /> Select an item to edit or resize
            </div>
          )}

          <svg 
            ref={svgRef}
            width="100%" 
            height="100%" 
            className="w-full h-full min-h-[600px]"
            style={{ backgroundColor: isEdit ? '#FAFAFA' : '#FFFFFF' }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Architectural Grid Pattern (Fades out in View Mode) */}
            <defs>
              <pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#d4d4d8" />
              </pattern>
            </defs>
            <rect 
              width="100%" height="100%" 
              fill="url(#blueprintGrid)" 
              className={`transition-opacity duration-500 ${isEdit ? 'opacity-100' : 'opacity-0'}`} 
            />

            {/* Loading State */}
            {isLoading && (
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-zinc-400 text-sm font-semibold animate-pulse">
                Loading layout...
              </text>
            )}

            {/* Render Elements */}
            {!isLoading && elements.map((el) => {
              const isSelected = el.id === selectedId;
              const isRound = el.type === 'table-round';
              
              // Colors adapt based on mode and whether it's a table
              const fillColors = !el.isTable ? '#e4e4e7' : (isEdit && isSelected ? '#18181b' : '#27272a');
              const hoverClass = isEdit && el.isTable ? 'hover:fill-zinc-600' : (!isEdit && el.isTable ? 'hover:fill-emerald-600 hover:scale-[1.02]' : '');
              const strokeColor = isEdit && isSelected ? '#3b82f6' : 'transparent'; 
              const cursorClass = isEdit ? 'cursor-grab active:cursor-grabbing' : (el.isTable ? 'cursor-pointer' : 'cursor-default');

              // Dynamic Chair Positioning Math
              const cx = el.width / 2;
              const cy = el.height / 2;
              const chairOffset = 14; 

              return (
                <g 
                  key={el.id} 
                  transform={`translate(${el.x}, ${el.y})`} 
                  className={`${cursorClass} group transition-transform origin-center`}
                  onPointerDown={(e) => handlePointerDown(e, el)}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                >
                  {/* Selection Highlight Ring (Edit Mode Only) */}
                  {isEdit && isSelected && (
                    <rect 
                      x={-10} y={-10} 
                      width={el.width + 20} height={el.height + 20} 
                      rx={isRound ? '50%' : 8}
                      fill="transparent" 
                      stroke={strokeColor} 
                      strokeWidth="2" 
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Dynamic Chairs (Rendered for Tables ONLY in Edit Mode) */}
                  {isEdit && el.isTable && (
                    <g className="fill-zinc-300 transition-colors duration-200 group-hover:fill-zinc-400">
                      <circle cx={cx} cy={-chairOffset} r="10" />
                      <circle cx={el.width + chairOffset} cy={cy} r="10" />
                      <circle cx={cx} cy={el.height + chairOffset} r="10" />
                      <circle cx={-chairOffset} cy={cy} r="10" />
                    </g>
                  )}

                  {/* Main Shape */}
                  {isRound ? (
                    <circle 
                      cx={cx} cy={cy} r={el.width / 2} 
                      fill={fillColors}
                      className={`transition-all duration-200 ${hoverClass}`}
                    />
                  ) : (
                    <rect 
                      width={el.width} height={el.height} rx={8} 
                      fill={fillColors}
                      className={`transition-all duration-200 ${hoverClass}`}
                      stroke={isEdit && isSelected && !el.isTable ? '#3b82f6' : 'transparent'} // subtle stroke for selected non-tables
                      strokeWidth={isEdit && isSelected && !el.isTable ? 2 : 0}
                    />
                  )}
                  
                  {/* Label (Changes color based on element type) */}
                  {el.label && (
                    <text 
                      x={cx} y={cy + 5} 
                      fill={el.isTable ? "white" : "#71717a"} 
                      fontSize={Math.min(24, el.width * 0.35)} 
                      fontWeight="bold" 
                      textAnchor="middle" 
                      className="pointer-events-none select-none"
                    >
                      {el.label}
                    </text>
                  )}

                  {/* Resize Handle (Edit Mode Only) */}
                  {isEdit && isSelected && (
                    <circle 
                      cx={el.width} cy={el.height} r="7" 
                      fill="#ffffff" 
                      stroke="#3b82f6"
                      strokeWidth="2"
                      className="cursor-se-resize shadow-sm"
                      onPointerDown={(e) => handleResizeDown(e, el.id)}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      </div>

      {/* --- QR Code View Drawer --- */}
      {isDrawerMounted && viewTable && (
        <div 
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300 ${isDrawerVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => closeDrawer()}
        >
          <div 
            className={`w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 border-l border-zinc-200 ${isDrawerVisible ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                Table {viewTable.label}
              </h2>
              <button 
                onClick={() => closeDrawer()}
                className="text-zinc-400 hover:text-zinc-800 transition-colors p-1.5 rounded-md hover:bg-zinc-100 cursor-pointer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center">
              <div className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 mb-5">
                  <QRCodeSVG 
                    value={typeof window !== 'undefined' ? `${window.location.origin}/table/${viewTable.label}` : `http://localhost:3000/table/${viewTable.label}`} 
                    size={200}
                    level="H"
                    includeMargin={false}
                    id={`qr-${viewTable.id}`}
                  />
                </div>
                <a 
                  href={typeof window !== 'undefined' ? `${window.location.origin}/table/${viewTable.label}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline text-center break-all w-full px-2 transition-colors cursor-pointer"
                >
                  {typeof window !== 'undefined' ? `${window.location.origin}/table/${viewTable.label}` : `.../table/${viewTable.label}`}
                </a>
              </div>

              <div className="w-full flex justify-between px-4 py-3 bg-zinc-50 rounded-lg border border-zinc-100 mb-6">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Seats</p>
                  <p className="text-lg font-bold text-zinc-900">{viewTable.seats}</p>
                </div>
                <div className="w-px bg-zinc-200"></div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Type</p>
                  <p className="text-lg font-bold text-zinc-900 capitalize">{viewTable.type.split('-')[1]}</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  const svg = document.getElementById(`qr-${viewTable.id}`);
                  if (!svg) return;
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `Table-${viewTable.label}-QR.svg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <Download size={18} strokeWidth={2.5} /> Download Vector QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent for the toolbar buttons
function ToolButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 w-full bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm px-4 py-3 rounded-xl text-sm font-semibold text-zinc-700 transition-all cursor-pointer"
    >
      <span className="text-zinc-500">{icon}</span>
      {label}
    </button>
  );
}