import type { ReactNode } from "react";
import ModalTop from "./ModalTop";
import type { ModalProps } from "../../types/modal";

export default function Modal({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  title,
  children,
  className = "",
}: ModalProps & { title: string; children: ReactNode; className: string }) {
  if (!isOpen) return null;

  return (
    <div
      className={`
        bg-white rounded-lg overflow-hidden 
        w-fit flex flex-col 
        border border-gray-600 shadow-lg
        `}
      onClick={(e) => e.stopPropagation()}
    >
      <ModalTop
        title={title}
        isMinimized={isMinimized}
        onClose={onClose}
        onMinimize={onMinimize}
      />

      <div className={`${className} ${isMinimized ? "h-0 p-0" : "h-auto p-2"}`}>
        {children}
      </div>
    </div>
  );
}
