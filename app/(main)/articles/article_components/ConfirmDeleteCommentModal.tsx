"use client";

import React, { useCallback, useEffect } from "react";

export interface ConfirmDeleteCommentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const ConfirmDeleteCommentModal: React.FC<ConfirmDeleteCommentModalProps> = ({
  open,
  onClose,
  onConfirm,
  isDeleting = false
}) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, handleEscape]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-lg w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-comment-modal-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="delete-comment-modal-title" className="text-lg font-semibold text-gray-900">
            Delete comment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-600">Are you sure you want to delete this comment? This cannot be undone.</p>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            {isDeleting ? "Deleting…" : "Delete comment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteCommentModal;
