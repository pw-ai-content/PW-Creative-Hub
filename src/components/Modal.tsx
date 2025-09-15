// src/components/Modal.tsx
import { createPortal } from "react-dom";
import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  children,
  z = 1000,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  z?: number;
}) {
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[${z}]`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-[min(92vw,640px)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
