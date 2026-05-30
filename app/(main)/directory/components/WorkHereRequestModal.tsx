'use client';

import React, { FC, useMemo, useState } from 'react';
import ConfirmModal from './ConfirmModal';

export interface WorkHereRequestModalProps {
  open: boolean;
  onClose: () => void;
  companyName: string;
}

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950 outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

const WorkHereRequestModal: FC<WorkHereRequestModalProps> = ({ open, onClose, companyName }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (submitting || sent) return false;
    return Boolean(fullName.trim() && email.trim() && role.trim() && message.trim());
  }, [submitting, sent, fullName, email, role, message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      // Placeholder: wire to real company workflow when available
      await new Promise((r) => setTimeout(r, 900));
      setSent(true);
    } catch {
      setError('Request could not be sent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const body = sent ? (
    <div className="space-y-3">
      <p className="text-sm text-gray-700">
        Your request has been sent. Once the company approves it, you will appear in the Team section.
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider text-sm"
        >
          Close
        </button>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <p className="text-sm text-gray-700">
        If you work at <span className="font-semibold text-gray-900">{companyName}</span>, you can fill out this form to
        send the company a recognition request. Once approved, you will appear as part of the Team.
      </p>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="workhere-name">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="workhere-name"
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={submitting}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="workhere-email">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="workhere-email"
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="workhere-role">
            Role / position <span className="text-red-500">*</span>
          </label>
          <input
            id="workhere-role"
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            disabled={submitting}
            placeholder="e.g. Sales Manager"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="workhere-message">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="workhere-message"
            className={`${inputClass} resize-y`}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={submitting}
            placeholder="Add any details that help the company verify your employment."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending…' : 'Send request'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <ConfirmModal open={open} onClose={onClose} title="Do you work here?">
      {body}
    </ConfirmModal>
  );
};

export default WorkHereRequestModal;

