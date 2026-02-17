"use client";

import React, { FC, useState, useEffect, useCallback } from "react";

const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

function isValidUrl(str: string): boolean {
  if (!str.trim()) return false;
  return URL_REGEX.test(str.trim());
}

interface UpdateImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl: string;
  onConfirm: (newUrl: string) => void;
}

const UpdateImageModal: FC<UpdateImageModalProps> = ({
  isOpen,
  onClose,
  currentImageUrl,
  onConfirm,
}) => {
  const [newUrl, setNewUrl] = useState("");
  const [touched, setTouched] = useState(false);

  const validUrl = isValidUrl(newUrl);
  const showError = touched && newUrl.length > 0 && !validUrl;
  const canConfirm = newUrl.trim().length > 0 && validUrl;

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    onConfirm(newUrl.trim());
    setNewUrl("");
    setTouched(false);
    onClose();
  }, [canConfirm, newUrl, onConfirm, onClose]);

  const handleClose = useCallback(() => {
    setNewUrl("");
    setTouched(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setNewUrl("");
      setTouched(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-image-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2
            id="update-image-title"
            className="text-lg font-semibold text-gray-900 uppercase tracking-wider"
          >
            Update image
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
            Current profile image URL
          </label>
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm break-all">
            {currentImageUrl || "—"}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
            New profile image URL
          </label>
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onBlur={() => setTouched(true)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950 ${
              showError ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="https://..."
          />
          {showError && (
            <p className="mt-1 text-sm text-red-500">Please enter a valid URL.</p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm update
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateImageModal;
