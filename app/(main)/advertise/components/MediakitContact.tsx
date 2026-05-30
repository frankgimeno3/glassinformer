'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import type { CartPricedItem } from '../types';

const phonePrefixes = [
  { code: '+34', country: 'Spain' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+39', country: 'Italy' },
  { code: '+351', country: 'Portugal' },
  { code: '+31', country: 'Netherlands' },
  { code: '+32', country: 'Belgium' },
  { code: '+41', country: 'Switzerland' },
];

const interestOptions = [
  'Portal advertising',
  'Magazine Advertising',
  'Dem Advertising',
  'General inquiry',
];

interface MediakitContactProps {
  contactRef: React.RefObject<HTMLDivElement | null>;
  pricedItems?: CartPricedItem[];
}

type MeResponse = {
  userName?: string;
  userSurnames?: string;
  userEmail?: string;
  userPhoneNumber?: string;
};

type EmployeeCompaniesResponse = {
  companies?: { country?: string }[];
};

function splitPhone(raw: string): { prefix?: string; number?: string } {
  const s = String(raw ?? '').trim();
  if (!s) return {};
  const m = s.match(/^(\+\d{1,4})\s*(.*)$/);
  if (!m) return { number: s.replace(/\s+/g, '') };
  const prefix = m[1];
  const rest = String(m[2] ?? '').trim().replace(/\s+/g, '');
  return { prefix, number: rest || undefined };
}

const MediakitContact: FC<MediakitContactProps> = ({ contactRef, pricedItems = [] }) => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyCountry: '',
    phonePrefix: '+34',
    phone: '',
    interest: '',
    message: '',
    acceptedTerms: false,
  });

  const isAutoFilledLocked = useMemo(() => isLogged, [isLogged]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/users/me', { credentials: 'include' });
        if (res.status === 401) {
          if (!cancelled) setIsLogged(false);
          return;
        }
        if (!res.ok) throw new Error(`me ${res.status}`);
        const me = (await res.json()) as MeResponse;

        const fullName = `${String(me?.userName ?? '').trim()} ${String(me?.userSurnames ?? '').trim()}`
          .replace(/\s+/g, ' ')
          .trim();
        const email = String(me?.userEmail ?? '').trim();

        const { prefix, number } = splitPhone(String(me?.userPhoneNumber ?? '').trim());
        const prefixAllowed = phonePrefixes.some((p) => p.code === prefix);

        let country = '';
        try {
          const cRes = await fetch('/api/v1/users/me/employee-companies', { credentials: 'include' });
          if (cRes.ok) {
            const cData = (await cRes.json()) as EmployeeCompaniesResponse;
            const companies = Array.isArray(cData?.companies) ? cData.companies : [];
            country =
              String(companies.find((c) => String(c?.country ?? '').trim())?.country ?? '').trim() || '';
          }
        } catch {
          // best-effort
        }

        if (cancelled) return;
        setIsLogged(true);
        setFormData((prev) => ({
          ...prev,
          ...(fullName ? { name: fullName } : {}),
          ...(email ? { email } : {}),
          ...(country ? { companyCountry: country } : {}),
          ...(number ? { phone: number } : {}),
          ...(prefixAllowed && prefix ? { phonePrefix: prefix } : {}),
        }));
      } catch {
        if (!cancelled) setIsLogged(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, acceptedTerms: e.target.checked }));
  };

  const isFormValid = () =>
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.companyCountry.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.interest !== '' &&
    formData.message.trim() !== '' &&
    formData.acceptedTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      setSubmitError(null);
      const services = pricedItems.map((p) => p.id);
      const subject = `Advertise — ${formData.interest}`;
      const contactPhone = `${formData.phonePrefix} ${formData.phone}`.trim();

      try {
        const res = await fetch('/api/v1/panel-tickets/public', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            company_country: formData.companyCountry.trim(),
            subject,
            message: formData.message,
            phone_country_prefix: formData.phonePrefix,
            phone_number: formData.phone.trim(),
            contact_phone: contactPhone,
            interest: formData.interest,
            ticket_type: 'advertisement',
            terms_accepted: formData.acceptedTerms,
            services_array: services,
          }),
        });

        if (!res.ok) {
          throw new Error(`Ticket could not be created (HTTP ${res.status})`);
        }

        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          companyCountry: '',
          phonePrefix: '+34',
          phone: '',
          interest: '',
          message: '',
          acceptedTerms: false,
        });
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Ticket could not be created');
      }
    }
  };

  return (
    <>
      <div ref={contactRef} className="mx-auto max-w-4xl mt-16 sm:mt-20">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 sm:mb-12 sm:text-4xl">Contact us</h2>
        {isSubmitted ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8 lg:p-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Thank you for your interest!</h3>
            <p className="mt-2 text-sm text-gray-600">We will contact you soon.</p>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="mt-6 rounded-lg bg-blue-950 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-950/90"
            >
              Send another request
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 lg:p-10"
          >
            <div className="space-y-6">
            {submitError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {submitError}
              </p>
            )}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-900">
                Full contact name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                readOnly={isAutoFilledLocked}
                aria-readonly={isAutoFilledLocked}
                className={`w-full rounded-lg border px-4 py-3 text-gray-900 outline-none transition-all duration-200 focus:border-gray-400 ${
                  isAutoFilledLocked ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-900">
                Contact email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all duration-200 focus:border-gray-400"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="companyCountry" className="mb-2 block text-sm font-semibold text-gray-900">
                Company country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyCountry"
                name="companyCountry"
                value={formData.companyCountry}
                onChange={handleInputChange}
                required
                readOnly={isAutoFilledLocked}
                aria-readonly={isAutoFilledLocked}
                className={`w-full rounded-lg border px-4 py-3 text-gray-900 outline-none transition-all duration-200 focus:border-gray-400 ${
                  isAutoFilledLocked ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
                }`}
                placeholder="e.g. Spain, United States"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Contact phone number <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="sm:w-48">
                  <label htmlFor="phonePrefix" className="mb-1 block text-xs text-gray-600">
                    Country prefix
                  </label>
                  <select
                    id="phonePrefix"
                    name="phonePrefix"
                    value={formData.phonePrefix}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all duration-200 focus:border-gray-400"
                  >
                    {phonePrefixes.map((prefix) => (
                      <option key={prefix.code} value={prefix.code}>
                        {prefix.code} ({prefix.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="phone" className="mb-1 block text-xs text-gray-600">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all duration-200 focus:border-gray-400"
                    placeholder="123456789"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="interest" className="mb-2 block text-sm font-semibold text-gray-900">
                What are you interested in? <span className="text-red-500">*</span>
              </label>
              <select
                id="interest"
                name="interest"
                value={formData.interest}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all duration-200 focus:border-gray-400"
              >
                <option value="">Select an option</option>
                {interestOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-semibold text-gray-900">
                Message – Request description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all duration-200 focus:border-gray-400"
                placeholder="Please describe your request..."
              />
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <p className="text-sm font-semibold text-gray-900">Selected services</p>
                {pricedItems.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500">No items selected yet.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    {pricedItems.map((it) => (
                      <li key={it.id} className="flex items-start justify-between gap-3">
                        <span className="flex-1">
                          {it.label}
                          {(it.quantity ?? 1) > 1 ? ` × ${it.quantity}` : ''}
                        </span>
                        <span className="shrink-0 font-medium text-gray-900">
                          {((it.priceUsd ?? 0) * (it.quantity ?? 1)).toLocaleString()} USD
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptedTerms"
                name="acceptedTerms"
                checked={formData.acceptedTerms}
                onChange={handleCheckboxChange}
                required
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="acceptedTerms" className="cursor-pointer text-sm text-gray-700">
                I accept the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="font-medium text-indigo-700 underline hover:text-indigo-600"
                >
                  terms and conditions
                </button>
                <span className="text-red-500"> *</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                isFormValid()
                  ? 'cursor-pointer bg-blue-950 text-white hover:bg-blue-950/90'
                  : 'cursor-not-allowed bg-gray-200 text-gray-500'
              }`}
            >
              Send
            </button>
          </div>
          </form>
        )}
      </div>

      {showTermsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms and Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
            <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 space-y-4">
              <p>By submitting this contact form, you agree to the following terms and conditions:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You consent to being contacted by Glassinformer regarding your inquiry.</li>
                <li>All information provided will be kept confidential and used solely for business communication purposes.</li>
                <li>You confirm that all information provided is accurate and truthful.</li>
                <li>Glassinformer reserves the right to decline any request at its discretion.</li>
                <li>Pricing and availability are subject to change without notice.</li>
                <li>All services are subject to separate agreements and terms of service.</li>
              </ul>
              <p className="mt-4">
                For more detailed information, please contact us directly at our official email address.
              </p>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 font-medium"
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediakitContact;
