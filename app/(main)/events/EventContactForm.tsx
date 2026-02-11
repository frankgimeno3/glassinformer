'use client';

import React, { useState } from 'react';

type Tab = 'visitor' | 'exhibitor';

const VISITOR_TAB = 'I want to assist as a visitor';
const EXHIBITOR_TAB = 'I want to exhibit';

export default function EventContactForm() {
  const [activeTab, setActiveTab] = useState<Tab>('visitor');

  // Visitor form
  const [visitorName, setVisitorName] = useState('');
  const [visitorCompany, setVisitorCompany] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorSubmitting, setVisitorSubmitting] = useState(false);
  const [visitorMessage, setVisitorMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Exhibitor form
  const [exhibitorName, setExhibitorName] = useState('');
  const [exhibitorCompany, setExhibitorCompany] = useState('');
  const [exhibitorEmail, setExhibitorEmail] = useState('');
  const [exhibitorCountry, setExhibitorCountry] = useState('');
  const [exhibitorPhone, setExhibitorPhone] = useState('');
  const [exhibitorDescription, setExhibitorDescription] = useState('');
  const [exhibitorSubmitting, setExhibitorSubmitting] = useState(false);
  const [exhibitorMessage, setExhibitorMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const clearVisitorMessage = () => setVisitorMessage(null);
  const clearExhibitorMessage = () => setExhibitorMessage(null);

  const validateVisitor = () => {
    if (!visitorName.trim() || !visitorCompany.trim() || !visitorEmail.trim()) return false;
    return true;
  };

  const validateExhibitor = () => {
    if (
      !exhibitorName.trim() ||
      !exhibitorCompany.trim() ||
      !exhibitorEmail.trim() ||
      !exhibitorCountry.trim() ||
      !exhibitorPhone.trim() ||
      !exhibitorDescription.trim()
    )
      return false;
    return true;
  };

  const simulateSubmit = (): Promise<{ ok: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ok: true }), 2000);
    });
  };

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateVisitor()) {
      setVisitorMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    setVisitorMessage(null);
    setVisitorSubmitting(true);
    try {
      await simulateSubmit();
      setVisitorMessage({ type: 'success', text: 'Form successfully submitted' });
    } catch {
      setVisitorMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setVisitorSubmitting(false);
    }
  };

  const handleExhibitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateExhibitor()) {
      setExhibitorMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    setExhibitorMessage(null);
    setExhibitorSubmitting(true);
    try {
      await simulateSubmit();
      setExhibitorMessage({ type: 'success', text: 'Form successfully submitted' });
    } catch {
      setExhibitorMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setExhibitorSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in touch</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => { setActiveTab('visitor'); clearVisitorMessage(); clearExhibitorMessage(); }}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'visitor'
              ? 'border-blue-950 text-blue-950'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {VISITOR_TAB}
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('exhibitor'); clearVisitorMessage(); clearExhibitorMessage(); }}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'exhibitor'
              ? 'border-blue-950 text-blue-950'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {EXHIBITOR_TAB}
        </button>
      </div>

      {/* Visitor form */}
      {activeTab === 'visitor' && (
        <form onSubmit={handleVisitorSubmit} className="space-y-4 max-w-xl">
          <div>
            <label htmlFor="visitor-name" className={labelClass}>
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              id="visitor-name"
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className={inputClass}
              required
              disabled={visitorSubmitting}
            />
          </div>
          <div>
            <label htmlFor="visitor-company" className={labelClass}>
              Your company <span className="text-red-500">*</span>
            </label>
            <input
              id="visitor-company"
              type="text"
              value={visitorCompany}
              onChange={(e) => setVisitorCompany(e.target.value)}
              className={inputClass}
              required
              disabled={visitorSubmitting}
            />
          </div>
          <div>
            <label htmlFor="visitor-email" className={labelClass}>
              Your email <span className="text-red-500">*</span>
            </label>
            <input
              id="visitor-email"
              type="email"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              className={inputClass}
              required
              disabled={visitorSubmitting}
            />
          </div>
          {visitorMessage && (
            <p
              className={`text-sm ${visitorMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
            >
              {visitorMessage.text}
            </p>
          )}
          <button
            type="submit"
            disabled={visitorSubmitting}
            className="px-6 py-3 bg-blue-950 text-white rounded-lg font-medium hover:bg-blue-900 cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 min-w-[180px] h-12 flex items-center justify-center"
          >
            {visitorSubmitting ? (
              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send and receive information'
            )}
          </button>
        </form>
      )}

      {/* Exhibitor form */}
      {activeTab === 'exhibitor' && (
        <form onSubmit={handleExhibitorSubmit} className="space-y-4 max-w-xl">
          <div>
            <label htmlFor="exhibitor-name" className={labelClass}>
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              id="exhibitor-name"
              type="text"
              value={exhibitorName}
              onChange={(e) => setExhibitorName(e.target.value)}
              className={inputClass}
              required
              disabled={exhibitorSubmitting}
            />
          </div>
          <div>
            <label htmlFor="exhibitor-company" className={labelClass}>
              Your company <span className="text-red-500">*</span>
            </label>
            <input
              id="exhibitor-company"
              type="text"
              value={exhibitorCompany}
              onChange={(e) => setExhibitorCompany(e.target.value)}
              className={inputClass}
              required
              disabled={exhibitorSubmitting}
            />
          </div>
          <div>
            <label htmlFor="exhibitor-email" className={labelClass}>
              Your email <span className="text-red-500">*</span>
            </label>
            <input
              id="exhibitor-email"
              type="email"
              value={exhibitorEmail}
              onChange={(e) => setExhibitorEmail(e.target.value)}
              className={inputClass}
              required
              disabled={exhibitorSubmitting}
            />
          </div>
          <div>
            <label htmlFor="exhibitor-country" className={labelClass}>
              Your country <span className="text-red-500">*</span>
            </label>
            <input
              id="exhibitor-country"
              type="text"
              value={exhibitorCountry}
              onChange={(e) => setExhibitorCountry(e.target.value)}
              className={inputClass}
              required
              disabled={exhibitorSubmitting}
            />
          </div>
          <div>
            <label htmlFor="exhibitor-phone" className={labelClass}>
              Contact phone <span className="text-red-500">*</span>
            </label>
            <input
              id="exhibitor-phone"
              type="tel"
              value={exhibitorPhone}
              onChange={(e) => setExhibitorPhone(e.target.value)}
              className={inputClass}
              required
              disabled={exhibitorSubmitting}
            />
          </div>
          <div>
            <label htmlFor="exhibitor-description" className={labelClass}>
              Company description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="exhibitor-description"
              rows={4}
              value={exhibitorDescription}
              onChange={(e) => setExhibitorDescription(e.target.value)}
              className={`${inputClass} resize-y`}
              required
              disabled={exhibitorSubmitting}
            />
          </div>
          {exhibitorMessage && (
            <p
              className={`text-sm ${exhibitorMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
            >
              {exhibitorMessage.text}
            </p>
          )}
          <button
            type="submit"
            disabled={exhibitorSubmitting}
            className="px-6 py-3 bg-blue-950 text-white rounded-lg font-medium hover:bg-blue-900 cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 min-w-[140px] h-12 flex items-center justify-center"
          >
            {exhibitorSubmitting ? (
              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send to sales'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
