"use client";

import React, { FC, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Tab = "add" | "edit";

interface CompanyAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasCurrentCompany: boolean;
  onNoLongerWorkHere?: () => void;
}

const ADD_PATH_JOIN = "/logged/companies/join";
const ADD_PATH_CREATE = "/logged/companies/create";

const CompanyAddEditModal: FC<CompanyAddEditModalProps> = ({
  isOpen,
  onClose,
  hasCurrentCompany,
  onNoLongerWorkHere,
}) => {
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("add");

  useEffect(() => {
    if (!isOpen) setTab(hasCurrentCompany ? "edit" : "add");
  }, [isOpen, hasCurrentCompany]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onClose]);

  const goTo = useCallback(
    (path: string) => {
      onClose();
      router.push(path);
    },
    [onClose, router]
  );

  const handleNoLongerWorkHere = useCallback(() => {
    onNoLongerWorkHere?.();
    onClose();
  }, [onNoLongerWorkHere, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2
            id="company-modal-title"
            className="text-lg font-semibold text-gray-900 uppercase tracking-wider"
          >
            Company
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

        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => setTab("add")}
            className={`px-4 py-2 text-sm font-medium uppercase tracking-wider ${
              tab === "add"
                ? "text-blue-950 border-b-2 border-blue-950"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={`px-4 py-2 text-sm font-medium uppercase tracking-wider ${
              tab === "edit"
                ? "text-blue-950 border-b-2 border-blue-950"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Edit
          </button>
        </div>

        {tab === "add" && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => goTo(ADD_PATH_JOIN)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-left uppercase tracking-wider"
            >
              Join another company
            </button>
            <button
              type="button"
              onClick={() => goTo(ADD_PATH_CREATE)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-left uppercase tracking-wider"
            >
              Create a new company
            </button>
          </div>
        )}

        {tab === "edit" && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleNoLongerWorkHere}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-left uppercase tracking-wider"
            >
              I no longer work here
            </button>
            <button
              type="button"
              onClick={() => goTo(ADD_PATH_JOIN)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-left uppercase tracking-wider"
            >
              Change to an existing company
            </button>
            <button
              type="button"
              onClick={() => goTo(ADD_PATH_CREATE)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-left uppercase tracking-wider"
            >
              Change to a new company
            </button>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 uppercase tracking-wider"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyAddEditModal;
