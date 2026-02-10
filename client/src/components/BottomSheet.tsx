import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onOpenChange, title, children }: BottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-border/60 bg-card p-4 pb-[calc(var(--tg-content-safe-area-inset-bottom)+16px)] shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <Dialog.Title className="text-sm font-semibold text-foreground">{title}</Dialog.Title>
            <Dialog.Close className="rounded-full p-2 text-muted-foreground hover:text-foreground">
              <X size={16} />
            </Dialog.Close>
          </div>
          <div className="pt-2">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
