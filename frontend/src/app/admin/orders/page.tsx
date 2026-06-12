"use client";

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Clock, ChefHat, CheckCircle2, Wifi, WifiOff, ArrowRight, LayoutDashboard, Map as MapIcon, X, Check } from 'lucide-react';

interface SelectedCustomizationOption {
  groupName: string;
  optionName: string;
  price: number;
}

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  selectedCustomizations?: SelectedCustomizationOption[];
}

interface Order {
  _id: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'served' | 'cancelled' | 'completed';
  createdAt: string;
}

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
  isTable: boolean;
}

interface FloorPlanData {
  _id: string;
  name: string;
  elements: FloorElement[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [viewMode, setViewMode] = useState<'board' | 'map'>('board');
  
  const [floors, setFloors] = useState<FloorPlanData[]>([]);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [isFloorsLoading, setIsFloorsLoading] = useState(true);

  const [selectedTableLabel, setSelectedTableLabel] = useState<string | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Orders fetching and sockets
  useEffect(() => {
    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    newSocket.on('new-order', (order: Order) => {
      setOrders(prev => [order, ...prev]);
    });

    newSocket.on('order-updated', (updatedOrder: Order) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Floors fetching
  useEffect(() => {
    fetch('http://localhost:5000/api/floorplan')
      .then(res => res.json())
      .then((data: FloorPlanData[]) => {
        if (data && data.length > 0) {
          setFloors(data);
          setActiveFloorId(data[0]._id);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsFloorsLoading(false));
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus as Order['status'] } : o));
    try {
      await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const servedOrders = orders.filter(o => o.status === 'served');

  const activeFloor = floors.find(f => f._id === activeFloorId);
  const elements = activeFloor?.elements || [];

  const handleTableClick = (label: string) => {
    setSelectedTableLabel(label);
    setTimeout(() => setIsDrawerVisible(true), 10);
  };

  const closeTableDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => setSelectedTableLabel(null), 300);
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-zinc-200 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Active Orders</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage kitchen workflow and fulfillments</p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* View Toggle */}
          <div className="flex bg-zinc-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                viewMode === 'board' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <LayoutDashboard size={16} /> Board View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                viewMode === 'map' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <MapIcon size={16} /> Map View
            </button>
          </div>

          {/* Connection Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-red-50 text-red-700 border border-red-200/50'
          }`}>
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isConnected ? 'Connected' : 'Reconnecting...'}
          </div>
        </div>
      </div>

      {viewMode === 'board' ? (
        /* Kanban Board */
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-8 overflow-y-auto">
          <ColumnLane title="New Orders" count={pendingOrders.length} icon={<Clock size={16} className="text-amber-500" />}>
            {pendingOrders.length === 0 && <EmptyState text="Waiting for orders" />}
            {pendingOrders.map(order => (
              <OrderTicket key={order._id} order={order} onUpdate={updateStatus} />
            ))}
          </ColumnLane>
          <ColumnLane title="Preparing" count={preparingOrders.length} icon={<ChefHat size={16} className="text-blue-500" />}>
            {preparingOrders.length === 0 && <EmptyState text="Kitchen is clear" />}
            {preparingOrders.map(order => (
              <OrderTicket key={order._id} order={order} onUpdate={updateStatus} />
            ))}
          </ColumnLane>
          <ColumnLane title="Served" count={servedOrders.length} icon={<CheckCircle2 size={16} className="text-emerald-500" />}>
            {servedOrders.length === 0 && <EmptyState text="No served orders yet" />}
            {servedOrders.map(order => (
              <OrderTicket key={order._id} order={order} onUpdate={updateStatus} />
            ))}
          </ColumnLane>
        </div>
      ) : (
        /* Map View */
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Floor Tabs */}
          {!isFloorsLoading && floors.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 border-b border-zinc-100 mb-4">
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
            </div>
          )}

          {/* Interactive Map Canvas */}
          <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden relative shadow-sm">
            {isFloorsLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-zinc-400 font-semibold animate-pulse">Loading Map...</p>
              </div>
            )}
            {!isFloorsLoading && (
              <svg 
                ref={svgRef}
                width="100%" 
                height="100%" 
                className="w-full h-full min-h-[600px]"
                style={{ backgroundColor: '#FAFAFA' }}
              >
                <defs>
                  <pattern id="blueprintGridOrders" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#d4d4d8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#blueprintGridOrders)" />

                {elements.map((el) => {
                  const isRound = el.type === 'table-round';
                  const cx = el.width / 2;
                  const cy = el.height / 2;
                  
                  let fillColor = '#e4e4e7';
                  let extraClasses = '';
                  
                  if (el.isTable) {
                    const tableOrders = orders.filter(o => o.tableNumber === el.label && o.status !== 'completed' && o.status !== 'cancelled');
                    if (tableOrders.length === 0) {
                      fillColor = '#10b981'; // Green
                    } else if (tableOrders.some(o => o.status === 'pending')) {
                      fillColor = '#ef4444'; // Red
                      extraClasses = 'animate-pulse';
                    } else if (tableOrders.some(o => o.status === 'preparing')) {
                      fillColor = '#fbbf24'; // Yellow
                    } else if (tableOrders.some(o => o.status === 'served')) {
                      fillColor = '#38bdf8'; // Light Blue
                    } else {
                      fillColor = '#10b981'; // Fallback
                    }
                  }

                  const cursorClass = el.isTable ? 'cursor-pointer' : 'cursor-default';
                  const hoverClass = el.isTable ? 'hover:scale-[1.02]' : '';

                  return (
                    <g 
                      key={el.id} 
                      transform={`translate(${el.x}, ${el.y})`} 
                      className={`${cursorClass} ${extraClasses} transition-transform origin-center`}
                      onClick={() => el.isTable && handleTableClick(el.label)}
                      style={{ transformOrigin: `${cx}px ${cy}px` }}
                    >
                      {isRound ? (
                        <circle cx={cx} cy={cy} r={el.width / 2} fill={fillColor} className={`transition-all duration-300 ${hoverClass}`} />
                      ) : (
                        <rect width={el.width} height={el.height} rx={8} fill={fillColor} className={`transition-all duration-300 ${hoverClass}`} />
                      )}
                      
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
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      )}

      {/* --- Sidebar Popup for Table Orders --- */}
      {selectedTableLabel !== null && viewMode === 'map' && (
        <div 
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300 ${isDrawerVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => closeTableDrawer()}
        >
          <div 
            className={`w-full max-w-md bg-zinc-50 h-full shadow-2xl flex flex-col transform transition-transform duration-300 border-l border-zinc-200 ${isDrawerVisible ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 bg-white shrink-0">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                Table {selectedTableLabel}
              </h2>
              <button 
                onClick={() => closeTableDrawer()}
                className="text-zinc-400 hover:text-zinc-800 transition-colors p-1.5 rounded-md hover:bg-zinc-100 cursor-pointer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
              {(() => {
                const tableActiveOrders = orders.filter(o => o.tableNumber === selectedTableLabel && o.status !== 'completed' && o.status !== 'cancelled');
                
                if (tableActiveOrders.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-40 bg-white border border-dashed border-zinc-300 rounded-xl">
                      <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                      <p className="text-zinc-500 font-medium">No active orders</p>
                    </div>
                  );
                }

                return tableActiveOrders.map(order => (
                  <OrderTicket key={order._id} order={order} onUpdate={updateStatus} />
                ));
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* --- Subcomponents --- */

function ColumnLane({ title, count, icon, children }: { title: string, count: number, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full bg-zinc-50/50 rounded-lg border border-zinc-100 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-zinc-800">{title}</h2>
        </div>
        <span className="flex items-center justify-center bg-white border border-zinc-200 text-zinc-600 text-xs font-medium h-6 w-6 rounded-md shadow-sm">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function OrderTicket({ order, onUpdate }: { order: Order, onUpdate: (id: string, status: string) => void }) {
  const isPending = order.status === 'pending';
  const isPreparing = order.status === 'preparing';
  const isServed = order.status === 'served';

  const timeString = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white border border-zinc-200 rounded-md p-4 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-200 group flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-zinc-100 text-zinc-700 px-2 py-1 rounded-md text-xs font-semibold tracking-wide">
            Table {order.tableNumber}
          </div>
        </div>
        <span className="text-xs font-medium text-zinc-400">{timeString}</span>
      </div>

      {/* Items List */}
      <div className="flex-1 mb-5">
        <ul className="space-y-3">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-800 leading-tight">
                  {item.name} <span className="text-zinc-500 font-bold ml-1 text-xs">x{item.quantity}</span>
                </span>
                {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                  <span className="text-xs text-zinc-500 mt-1">
                    {item.selectedCustomizations.map(c => c.optionName).join(', ')}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer & Action */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-auto">
        <span className="text-sm font-semibold text-zinc-900">${order.totalAmount.toFixed(2)}</span>
        
        {isPending && (
          <button 
            onClick={() => onUpdate(order._id, 'preparing')}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            Prepare <ArrowRight size={14} />
          </button>
        )}
        {isPreparing && (
          <button 
            onClick={() => onUpdate(order._id, 'served')}
            className="flex items-center gap-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            Serve <CheckCircle2 size={14} className="text-emerald-500" />
          </button>
        )}
        {isServed && (
          <button 
            onClick={() => onUpdate(order._id, 'completed')}
            className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            Close Order <Check size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-8 text-center bg-white/50 border border-dashed border-zinc-200 rounded-md">
      <p className="text-sm font-medium text-zinc-400">{text}</p>
    </div>
  );
}