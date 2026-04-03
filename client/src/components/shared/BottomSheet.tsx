import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal
        className="relative z-10 bg-stone-900 rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-600" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-stone-700">
            <h2 className="text-lg font-semibold text-stone-100">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-stone-400 hover:text-stone-200 p-1 rounded-full"
            >
              ✕
            </button>
          </div>
        )}

        <div className="px-4 pb-8 pt-2">{children}</div>
      </div>
    </div>
  );
}
