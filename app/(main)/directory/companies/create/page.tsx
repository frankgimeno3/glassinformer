'use client';

import React, { FC, useMemo, useState } from 'react';
import Link from 'next/link';
import { CompanyService } from '@/apiClient/CompanyService';
import countriesRegions from '@/app/general_components/countries_regions.json';
import ContentPageShell from '@/app/general_components/ContentPageShell';

const COUNTRY_NOT_IN_LIST_MESSAGE =
  'You must choose a country from the available list. The text you entered does not match any country name—please pick one of the listed countries (type to filter, then select an exact match).';

const SUCCESS_MESSAGE =
  'Your company request has been submitted successfully. Directory administrators will review and approve it. This approval step is required to prevent fraudulent submissions by bots, automated tools, or malicious users.';

function normalizeCountryKey(value: string) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s'()-]/g, '')
    .replace(/\s+/g, ' ');
}

function looksLikeTechnicalServerMessage(msg: string) {
  return /violates|constraint|null value|relation "|sequelize|ECONNREFUSED|ETIMEDOUT|internal server/i.test(msg);
}

/** Add https://www. when the user omits the scheme (e.g. www.example.com → https://www.example.com). */
function normalizeCompanyWebsiteUrl(raw: string): string {
  const v = String(raw ?? '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (/^www\./i.test(v)) return `https://${v}`;
  return `https://www.${v}`;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (!err || typeof err !== 'object') return '';
  const o = err as Record<string, unknown>;
  if (typeof o.message === 'string' && o.message) return o.message;
  const data = o.data as { message?: string } | undefined;
  if (typeof data?.message === 'string' && data.message) return data.message;
  const resp = o.response as { data?: { message?: string } } | undefined;
  const fromBody = resp?.data?.message;
  if (typeof fromBody === 'string' && fromBody) return fromBody;
  return '';
}

const CreateCompanyDirectory: FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [mainDescription, setMainDescription] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [listAsEmployee, setListAsEmployee] = useState(false);
  const [visibleRole, setVisibleRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const availableCountries = useMemo(() => {
    const list = Array.isArray(countriesRegions) ? (countriesRegions as { country?: string }[]) : [];
    const countries = list.map((x) => String(x?.country ?? '').trim()).filter(Boolean);
    return Array.from(new Set(countries)).sort((a, b) => a.localeCompare(b));
  }, []);

  const countrySet = useMemo(() => {
    const set = new Set<string>();
    availableCountries.forEach((c) => set.add(normalizeCountryKey(c)));
    return set;
  }, [availableCountries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedName = companyName.trim();
    const trimmedCountry = country.trim();
    const trimmedDescription = mainDescription.trim();
    const trimmedWebsite = normalizeCompanyWebsiteUrl(companyWebsite);
    if (trimmedWebsite !== companyWebsite.trim()) {
      setCompanyWebsite(trimmedWebsite);
    }
    const roleTrim = visibleRole.trim();

    if (!trimmedName || !trimmedCountry || !trimmedDescription) {
      setError('Please fill in company name, country and main description.');
      return;
    }
    if (!countrySet.has(normalizeCountryKey(trimmedCountry))) {
      setError(COUNTRY_NOT_IN_LIST_MESSAGE);
      return;
    }
    if (listAsEmployee && !roleTrim) {
      setError('Please enter your role at the company. This is required when you choose to appear as an employee.');
      return;
    }

    setSubmitting(true);
    try {
      await CompanyService.submitDirectoryCompanyRequest({
        company_name: trimmedName,
        country: trimmedCountry,
        main_description: trimmedDescription,
        company_website: trimmedWebsite,
        list_as_employee: listAsEmployee,
        visible_role: listAsEmployee ? roleTrim : '',
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const raw = getErrorMessage(err);
      const status = (err as { status?: number })?.status;
      if (status === 401 || /not authenticated|authentication required|sesión|session/i.test(raw)) {
        setError('You must be signed in to submit a company request. Please log in and try again.');
      } else if (looksLikeTechnicalServerMessage(raw)) {
        setError(
          'We could not submit your request. Please check all fields and try again. If you need help, contact support.'
        );
      } else {
        setError(raw || 'Something went wrong while submitting your request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ContentPageShell maxWidthClass="max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-900 uppercase tracking-wider">
          Request company listing
        </h1>
        <Link
          href="/directory"
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 uppercase tracking-wider text-sm"
        >
          Back
        </Link>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-900 text-sm leading-relaxed">
          {SUCCESS_MESSAGE}
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Company name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                placeholder="e.g. GlassTech Solutions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Country <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                list="countries-list"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                placeholder="e.g. Spain"
              />
              <datalist id="countries-list">
                {availableCountries.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <p className="mt-1.5 text-xs text-gray-500">
                Choose an exact country name from the suggestions (your entry must match a listed country).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Company website
              </label>
              <input
                type="text"
                inputMode="url"
                autoComplete="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                onBlur={() => {
                  const n = normalizeCompanyWebsiteUrl(companyWebsite);
                  if (n !== companyWebsite) setCompanyWebsite(n);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                placeholder="e.g. example.com or www.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Main description <span className="text-red-600">*</span>
              </label>
              <textarea
                value={mainDescription}
                onChange={(e) => setMainDescription(e.target.value)}
                required
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                placeholder="Brief description of the company"
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <span className="block text-sm font-medium text-gray-800 mb-2">
                Do you want to appear as an employee of this company on the directory?
              </span>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${!listAsEmployee ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                  No
                </span>
                <label
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-within:ring-2 focus-within:ring-blue-950 focus-within:ring-offset-2 ${
                    listAsEmployee ? 'bg-blue-950' : 'bg-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={listAsEmployee}
                    onChange={(e) => {
                      setListAsEmployee(e.target.checked);
                      if (!e.target.checked) setVisibleRole('');
                    }}
                    className="sr-only peer"
                    role="switch"
                    aria-checked={listAsEmployee}
                  />
                  <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform peer-checked:translate-x-5" />
                </label>
                <span className={`text-sm ${listAsEmployee ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                  Yes
                </span>
              </div>
              {listAsEmployee && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your role at the company <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={visibleRole}
                    onChange={(e) => setVisibleRole(e.target.value)}
                    required={listAsEmployee}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                    placeholder="e.g. Sales Director"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit request'}
              </button>
              <Link
                href="/directory"
                className="px-6 py-2 rounded-lg border border-blue-950 text-blue-950 hover:bg-blue-950/10 uppercase tracking-wider text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </>
      )}
    </ContentPageShell>
  );
};

export default CreateCompanyDirectory;
