'use client';

import React, { useState, useMemo } from 'react';

export default function CompanyContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyCountry, setCompanyCountry] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isFormValid = useMemo(
    () =>
      Boolean(
        name.trim() &&
          email.trim() &&
          companyName.trim() &&
          companyCountry.trim() &&
          description.trim()
      ),
    [name, email, companyName, companyCountry, description]
  );

  const canSubmit = isFormValid && !submitting && !success;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Simulate send; replace with real API call when available
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch {
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  if (success) {
    return (
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact company</h2>
        <p className="text-green-600 font-medium">Message sent to company</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact company</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="contact-company-name" className={labelClass}>
            Company name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={inputClass}
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="contact-company-country" className={labelClass}>
            Company country <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-company-country"
            type="text"
            value={companyCountry}
            onChange={(e) => setCompanyCountry(e.target.value)}
            className={inputClass}
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="contact-description" className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contact-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-y`}
            required
            disabled={submitting}
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="px-6 py-3 bg-blue-950 text-white rounded-lg font-medium hover:bg-blue-900 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 min-w-[120px] h-12 flex items-center justify-center"
        >
          {submitting ? (
            <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Send'
          )}
        </button>
      </form>
    </div>
  );
}
