"use client";

import React, { FC, useState, useEffect, useCallback } from "react";
import { CompanyService } from "@/apiClient/CompanyService";
import UpdateImageModal from "../profileComponents/UpdateImageModal";
import CompanyAddEditModal from "../profileComponents/CompanyAddEditModal";

interface ExperienceItem {
  from: string;
  to: string;
  "company name": string;
  position: string;
  description: string;
}

interface UserCurrentCompany {
  id_company: string;
  userPosition: string;
}

interface UserData {
  id_user: string;
  userName: string;
  userSurnames: string;
  userCurrentCompany: UserCurrentCompany;
  experienceArray: ExperienceItem[];
  userMainImageSrc: string;
  userDescription: string;
  userLinkedinProfile?: string;
}

interface CompanyEntry {
  id_company: string;
  company_name: string;
}

const Field: FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}> = ({ label, value, onChange, multiline }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
      {label}
    </label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
        rows={4}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
      />
    )}
  </div>
);

const ExperienceCard: FC<{ item: ExperienceItem }> = ({ item }) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
    <p className="font-bold text-gray-900">{item["company name"]}</p>
    <p className="text-gray-400 text-sm mt-1">{item.from} – {item.to}</p>
    <p className="text-gray-700 mt-2">{item.position}</p>
    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{item.description}</p>
  </div>
);

const API_ME = "/api/v1/users/me";

/** Default avatar when user has no image URL (Unsplash: black & white street sign – WMRI9HvAwV4) */
const DEFAULT_AVATAR_SRC =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256&h=256&fit=crop&q=80";

const LINKEDIN_PREFIX = "http://www.linkedin.com/in/";

function extractLinkedinHandle(rawUrl: string): string {
  const url = String(rawUrl ?? "").trim();
  if (!url) return "";
  const idx = url.indexOf(LINKEDIN_PREFIX);
  if (idx === -1) return "";
  const handle = url.slice(idx + LINKEDIN_PREFIX.length).replace(/^\/+/, "").replace(/\/+$/, "");
  return handle;
}

function isValidLinkedinHandle(handle: string): boolean {
  // Strict allowlist: letters, numbers, hyphen only. Prevents any injection-style characters.
  // LinkedIn public profile handles are typically >= 3 chars; cap to avoid abuse.
  return /^[a-zA-Z0-9-]{3,80}$/.test(handle);
}

function buildLinkedinUrlFromHandle(handle: string): string {
  return `${LINKEDIN_PREFIX}${handle}`;
}

const YesNoToggle: FC<{
  value: boolean;
  onChange: (next: boolean) => void;
  label: string;
}> = ({ value, onChange, label }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
      {label}
    </label>
    <div className="flex items-center gap-3">
      <span className={`text-xs font-semibold uppercase tracking-wider ${!value ? "text-gray-900" : "text-gray-500"}`}>
        No
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-7 w-14 items-center rounded-full border transition-colors ${
          value ? "bg-blue-950 border-blue-950" : "bg-gray-200 border-gray-300"
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
      <span className={`text-xs font-semibold uppercase tracking-wider ${value ? "text-gray-900" : "text-gray-500"}`}>
        Yes
      </span>
    </div>
  </div>
);

const MyProfile: FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [userName, setUserName] = useState("");
  const [userSurnames, setUserSurnames] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [userMainImageSrc, setUserMainImageSrc] = useState("");
  const [currentCompanyId, setCurrentCompanyId] = useState("");
  const [currentCompanyPosition, setCurrentCompanyPosition] = useState("");
  const [showLinkedinProfile, setShowLinkedinProfile] = useState(false);
  const [linkedinHandle, setLinkedinHandle] = useState("");
  const [linkedinError, setLinkedinError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [updateImageOpen, setUpdateImageOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companiesList, setCompaniesList] = useState<CompanyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_ME, { credentials: "include" });
        if (res.status === 401) {
          setError("No active session. Please log in to view your profile.");
          setUser(null);
          return;
        }
        if (!res.ok) {
          setError("Failed to load profile.");
          setUser(null);
          return;
        }
        const data: UserData = await res.json();
        setUser(data);
        setUserName(data.userName ?? "");
        setUserSurnames(data.userSurnames ?? "");
        setUserDescription(data.userDescription ?? "");
        setUserMainImageSrc(data.userMainImageSrc ?? "");
        setCurrentCompanyId(data.userCurrentCompany?.id_company ?? "");
        setCurrentCompanyPosition(data.userCurrentCompany?.userPosition ?? "");

        const existingHandle = extractLinkedinHandle(String(data.userLinkedinProfile ?? ""));
        if (existingHandle) {
          setShowLinkedinProfile(true);
          setLinkedinHandle(existingHandle);
          setLinkedinError(null);
        } else {
          setShowLinkedinProfile(false);
          setLinkedinHandle("");
          setLinkedinError(null);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load profile.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await CompanyService.getAllCompanies();
        setCompaniesList(
          Array.isArray(data)
            ? data.map((c: { id_company: string; company_name: string }) => ({
                id_company: c.id_company,
                company_name: c.company_name,
              }))
            : []
        );
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompaniesList([]);
      }
    };
    fetchCompanies();
  }, []);

  const getCompanyNameById = useCallback(
    (id: string): string => {
      const found = companiesList.find((c) => c.id_company === id);
      return found?.company_name ?? id;
    },
    [companiesList]
  );

  useEffect(() => {
    if (!user) return;
    const savedHandle = extractLinkedinHandle(String(user.userLinkedinProfile ?? ""));
    const desiredLinkedinUrl = showLinkedinProfile
      ? (isValidLinkedinHandle(linkedinHandle) ? buildLinkedinUrlFromHandle(linkedinHandle) : "")
      : "";
    const changed =
      userName !== user.userName ||
      userSurnames !== user.userSurnames ||
      userDescription !== user.userDescription ||
      userMainImageSrc !== user.userMainImageSrc ||
      currentCompanyId !== (user.userCurrentCompany?.id_company ?? "") ||
      currentCompanyPosition !== (user.userCurrentCompany?.userPosition ?? "") ||
      (showLinkedinProfile ? linkedinHandle !== savedHandle : savedHandle !== "") ||
      (showLinkedinProfile && desiredLinkedinUrl === "" && linkedinHandle.trim() !== "");
    setDirty(changed);
  }, [
    user,
    userName,
    userSurnames,
    userDescription,
    userMainImageSrc,
    currentCompanyId,
    currentCompanyPosition,
    showLinkedinProfile,
    linkedinHandle,
  ]);

  const handleUpdateChanges = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(API_ME, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          userSurnames,
          userDescription,
          userMainImageSrc,
          userLinkedinProfile:
            showLinkedinProfile && isValidLinkedinHandle(linkedinHandle)
              ? buildLinkedinUrlFromHandle(linkedinHandle)
              : "",
          userCurrentCompany: { id_company: currentCompanyId, userPosition: currentCompanyPosition },
          experienceArray: user.experienceArray ?? [],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save changes.");
      }
      const updated: UserData = await res.json();
      setUser(updated);
      setDirty(false);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageConfirm = useCallback((newUrl: string) => {
    setUserMainImageSrc(newUrl);
  }, []);

  const handleNoLongerWorkHere = useCallback(() => {
    setCurrentCompanyId("");
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-600 text-center">
        <p>Loading profile…</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-gray-600">
        <p>{error || "User not found."}</p>
        {error?.toLowerCase().includes("session") && (
          <a href="/auth/login" className="mt-2 inline-block text-blue-950 underline">
            Go to login
          </a>
        )}
      </div>
    );
  }

  const currentCompanyName = currentCompanyId
    ? getCompanyNameById(currentCompanyId)
    : "";

  const isLinkedinValidNow =
    !showLinkedinProfile ||
    (linkedinHandle.trim() === "" ? false : isValidLinkedinHandle(linkedinHandle));

  const primaryActionClass =
    "cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-lg shadow bg-blue-950 hover:bg-blue-950/90 disabled:opacity-60 text-white text-sm font-semibold uppercase tracking-wider transition-colors";

  return (
    <div className="bg-white">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          {/* Row 1: actions, right-aligned */}
          <div className="flex items-center justify-end gap-3">
            {dirty ? (
              <button
                type="button"
                onClick={handleUpdateChanges}
                disabled={saving || !isLinkedinValidNow}
                className={primaryActionClass}
              >
                {saving ? "Saving…" : "Update changes"}
              </button>
            ) : null}
            <a
              href="/logged/profiles"
              className={`${primaryActionClass} whitespace-nowrap`}
            >
              View all profiles
            </a>
          </div>

          {/* Row 2: title */}
          <div className="mt-4">
            <h1 className="text-2xl font-serif font-bold text-gray-900 text-center">
              My profile
            </h1>
          </div>
        </div>

        {/* Keep the form centered but not overly narrow */}
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="flex justify-center">
            <div className="relative inline-block">
              <img
                src={userMainImageSrc || DEFAULT_AVATAR_SRC}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => setUpdateImageOpen(true)}
                className="cursor-pointer absolute bottom-0 right-0 px-3 py-1.5 text-[11px] font-semibold rounded-lg shadow bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider transition-colors"
              >
                update image
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name" value={userName} onChange={setUserName} />
              <Field
                label="Surnames"
                value={userSurnames}
                onChange={setUserSurnames}
              />
            </div>

            <Field
              label="User description"
              value={userDescription}
              onChange={setUserDescription}
              multiline
            />

            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Current position
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Your current company and role shown on your profile.
                </p>
              </div>
              <div className="px-4 py-5 sm:px-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
                    Current company
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                      {currentCompanyName || "—"}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCompanyModalOpen(true)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 uppercase tracking-wider whitespace-nowrap"
                    >
                      add or edit
                    </button>
                  </div>
                </div>

                <Field
                  label="Current role"
                  value={currentCompanyPosition}
                  onChange={setCurrentCompanyPosition}
                />
              </div>
            </section>
          </div>

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900">LinkedIn</h2>
              <p className="mt-1 text-sm text-gray-600">
                Optionally show your LinkedIn profile on your public profile page.
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <YesNoToggle
                label="Show LinkedIn profile?"
                value={showLinkedinProfile}
                onChange={(next) => {
                  setShowLinkedinProfile(next);
                  setLinkedinError(null);
                  if (!next) {
                    setLinkedinHandle("");
                  }
                }}
              />

              {showLinkedinProfile ? (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    LinkedIn URL
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <span className="shrink-0 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      {LINKEDIN_PREFIX}
                    </span>
                    <input
                      type="text"
                      value={linkedinHandle}
                      onChange={(e) => {
                        const next = String(e.target.value || "").trim();
                        if (!next) {
                          setLinkedinHandle("");
                          setLinkedinError("Please enter your LinkedIn handle.");
                          return;
                        }
                        if (!/^[a-zA-Z0-9-]*$/.test(next)) {
                          setLinkedinError("Only letters, numbers, and hyphens are allowed.");
                          return;
                        }
                        setLinkedinHandle(next);
                        setLinkedinError(
                          isValidLinkedinHandle(next)
                            ? null
                            : "Handle must be 3–80 characters (letters, numbers, hyphens)."
                        );
                      }}
                      placeholder="your-handle"
                      className="w-full sm:flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                      inputMode="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>

                  {linkedinError ? (
                    <p className="mt-2 text-sm text-red-700">{linkedinError}</p>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">
                      Allowed: letters, numbers, hyphens. No spaces.
                    </p>
                  )}

                  {isValidLinkedinHandle(linkedinHandle) ? (
                    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Preview
                      </p>
                      <a
                        href={buildLinkedinUrlFromHandle(linkedinHandle)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block text-sm text-blue-950 underline break-all"
                      >
                        {buildLinkedinUrlFromHandle(linkedinHandle)}
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-sm text-gray-700">
                    Your LinkedIn profile is currently hidden.
                  </p>
                </div>
              )}
            </div>
          </section>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
              Experience
            </label>
            {(user.experienceArray ?? []).length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <p className="text-sm text-gray-700">
                  No experience entries yet. Fill in your{" "}
                  <span className="font-semibold">Current position</span> to start showing your experience here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {(user.experienceArray ?? []).map((item, index) => (
                  <ExperienceCard key={index} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save button moved to header (top-right). */}
      </div>

      <UpdateImageModal
        isOpen={updateImageOpen}
        onClose={() => setUpdateImageOpen(false)}
        currentImageUrl={userMainImageSrc}
        onConfirm={handleImageConfirm}
      />

      <CompanyAddEditModal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        hasCurrentCompany={!!currentCompanyId}
        onNoLongerWorkHere={handleNoLongerWorkHere}
      />
    </div>
  );
};

export default MyProfile;
