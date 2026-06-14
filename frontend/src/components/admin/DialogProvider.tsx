"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type DialogType = 'alert' | 'confirm';

interface DialogOptions {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
}

interface DialogContextType {
  alert: (message: string | DialogOptions) => Promise<void>;
  confirm: (message: string | DialogOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

interface DialogState extends DialogOptions {
  id: string;
  dialogType: DialogType;
  resolve: (value: boolean | void | PromiseLike<boolean | void>) => void;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<DialogState[]>([]);

  const alert = useCallback((options: string | DialogOptions): Promise<void> => {
    return new Promise((resolve) => {
      const opts = typeof options === 'string' ? { message: options } : options;
      setDialogs((prev) => [
        ...prev,
        {
          ...opts,
          id: Math.random().toString(36).substr(2, 9),
          dialogType: 'alert',
          resolve: resolve as any,
        },
      ]);
    });
  }, []);

  const confirm = useCallback((options: string | DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const opts = typeof options === 'string' ? { message: options } : options;
      setDialogs((prev) => [
        ...prev,
        {
          ...opts,
          id: Math.random().toString(36).substr(2, 9),
          dialogType: 'confirm',
          resolve: resolve as any,
        },
      ]);
    });
  }, []);

  const handleClose = (id: string, result: boolean) => {
    setDialogs((prev) => prev.filter((d) => d.id !== id));
    const dialog = dialogs.find((d) => d.id === id);
    if (dialog) {
      dialog.resolve(result);
    }
  };

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      {dialogs.map((dialog) => (
        <div key={dialog.id} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => dialog.dialogType === 'alert' && handleClose(dialog.id, true)}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  dialog.type === 'error' ? 'bg-red-50 text-red-500' :
                  dialog.type === 'warning' ? 'bg-amber-50 text-amber-500' :
                  dialog.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                  'bg-blue-50 text-blue-500'
                }`}>
                  {dialog.type === 'error' || dialog.type === 'warning' ? <AlertCircle size={20} /> :
                   dialog.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-zinc-900 leading-tight mb-1">
                    {dialog.title || (dialog.dialogType === 'confirm' ? 'Please Confirm' : 'Information')}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {dialog.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
              {dialog.dialogType === 'confirm' && (
                <button
                  onClick={() => handleClose(dialog.id, false)}
                  className="px-4 py-2 text-sm font-semibold text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  {dialog.cancelText || 'Cancel'}
                </button>
              )}
              <button
                onClick={() => handleClose(dialog.id, true)}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${
                  dialog.type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-zinc-900 hover:bg-zinc-800'
                }`}
              >
                {dialog.confirmText || (dialog.dialogType === 'confirm' ? 'Confirm' : 'OK')}
              </button>
            </div>
          </div>
        </div>
      ))}
    </DialogContext.Provider>
  );
}
