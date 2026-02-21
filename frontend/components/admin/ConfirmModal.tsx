"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onCancel();
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-2xl"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-50">{title}</h3>
              {description ? (
                <p className="text-sm leading-relaxed text-slate-400">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900"
                onClick={() => onCancel()}
                disabled={confirmLoading}
              >
                {cancelText}
              </Button>
              <Button
                className="bg-teal-600 text-white hover:bg-teal-500"
                onClick={() => onConfirm()}
                disabled={confirmLoading}
              >
                {confirmLoading ? "Working..." : confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
