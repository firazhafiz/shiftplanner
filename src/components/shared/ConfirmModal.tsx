"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

export default function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Lanjutkan",
  cancelText = "Batal",
  variant = "primary",
}: ConfirmModalProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200 focus:outline-none">
          <AlertDialog.Title className="text-2xl font-black text-black tracking-tight mb-2">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm font-medium text-(--color-muted) leading-relaxed mb-8">
            {description}
          </AlertDialog.Description>
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button className="h-12 px-6 rounded-md font-bold text-sm bg-[#ececec] text-black hover:bg-black/5 transition-all">
                {cancelText}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onConfirm();
                  onOpenChange(false);
                }}
                className={cn(
                  "h-12 px-6 rounded-md font-black text-sm transition-all",
                  variant === "danger"
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                    : "bg-black text-white hover:bg-(--color-primary) hover:text-black shadow-lg shadow-black/10",
                )}
              >
                {confirmText}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
