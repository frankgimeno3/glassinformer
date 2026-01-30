"use client";

import React, { FC, useEffect, useCallback } from "react";

export interface CompanyOption {
  id_company: string;
  company_name: string;
  main_description: string;
}

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyOption | null;
  onConfirm: (description: string) => void;
}

const JoinRequestModal: FC<JoinRequestModalProps> = ({
  isOpen,
  onClose,
  company,
  onConfirm,
}) => {
  const [description, setDescription] = React.useState("");
  const canConfirm = description.trim().length > 0;

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    onConfirm(description.trim());
    setDescription("");
    onClose();
  }, [canConfirm, description, onConfirm, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) setDescription("");
  }, [isOpen]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-request-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2
            id="join-request-title"
            className="text-lg font-semibold text-gray-900 uppercase tracking-wider"
          >
            Join request
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Do you want to send a request for the company
          {company ? ` &quot;${company.company_name}&quot;` : ""}?
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
            placeholder="Introduce yourself and why you want to join..."
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
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
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestModal;
