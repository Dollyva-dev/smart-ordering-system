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
  isClosing?: boolean;
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
    setDialogs((prev) => {
      const dialog = prev.find((d) => d.id === id);
      if (dialog && !dialog.isClosing) {
        dialog.resolve(result); // Resolve immediately so caller isn't blocked by animation
        return prev.map((d) => d.id === id ? { ...d, isClosing: true } : d);
      }
      return prev;
    });

    setTimeout(() => {
      setDialogs((prev) => prev.filter((d) => d.id !== id));
    }, 250); // match animation duration
  };

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <style>{`
        @keyframes dialogFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes dialogFadeOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.95) translateY(10px); }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes overlayFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .dialog-animate {
          animation: dialogFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .dialog-animate-out {
          animation: dialogFadeOut 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .overlay-animate {
          animation: overlayFadeIn 0.3s ease-out forwards;
        }
        .overlay-animate-out {
          animation: overlayFadeOut 0.25s ease-out forwards;
        }
      `}</style>
      {dialogs.map((dialog) => (
        <div key={dialog.id} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm ${dialog.isClosing ? 'overlay-animate-out' : 'overlay-animate'}`} 
            onClick={() => dialog.dialogType === 'alert' && handleClose(dialog.id, true)}
          />
          <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 ${dialog.isClosing ? 'dialog-animate-out' : 'dialog-animate'}`}>
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
