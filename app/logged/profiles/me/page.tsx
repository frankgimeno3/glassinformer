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
const DEFAULT_AVATAR_SRC = "https://source.unsplash.com/WMRI9HvAwV4/256x256";

const MyProfile: FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [userName, setUserName] = useState("");
  const [userSurnames, setUserSurnames] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [userMainImageSrc, setUserMainImageSrc] = useState("");
  const [currentCompanyId, setCurrentCompanyId] = useState("");
  const [currentCompanyPosition, setCurrentCompanyPosition] = useState("");
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
          setError("No hay sesión activa. Inicia sesión para ver tu perfil.");
          setUser(null);
          return;
        }
        if (!res.ok) {
          setError("Error al cargar el perfil.");
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
      } catch (e) {
        console.error(e);
        setError("Error al cargar el perfil.");
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
    const changed =
      userName !== user.userName ||
      userSurnames !== user.userSurnames ||
      userDescription !== user.userDescription ||
      userMainImageSrc !== user.userMainImageSrc ||
      currentCompanyId !== (user.userCurrentCompany?.id_company ?? "") ||
      currentCompanyPosition !== (user.userCurrentCompany?.userPosition ?? "");
    setDirty(changed);
  }, [
    user,
    userName,
    userSurnames,
    userDescription,
    userMainImageSrc,
    currentCompanyId,
    currentCompanyPosition,
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
          userCurrentCompany: { id_company: currentCompanyId, userPosition: currentCompanyPosition },
          experienceArray: user.experienceArray ?? [],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al guardar");
      }
      const updated: UserData = await res.json();
      setUser(updated);
      setDirty(false);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Error al guardar los cambios.");
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
        <p>Cargando perfil…</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-gray-600">
        <p>{error || "User not found."}</p>
        {error?.includes("sesión") && (
          <a href="/auth/login" className="mt-2 inline-block text-blue-950 underline">
            Ir a iniciar sesión
          </a>
        )}
      </div>
    );
  }

  const currentCompanyName = currentCompanyId
    ? getCompanyNameById(currentCompanyId)
    : "";

  return (
    <div className="bg-white">
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif font-bold text-gray-900 text-center lowercase">
            my profile
          </h1>
          <a
            href="/logged/profiles"
            className="text-sm text-blue-950 hover:underline uppercase tracking-wider"
          >
            Ver todos los perfiles
          </a>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="relative inline-block">
            <img
              src={userMainImageSrc || DEFAULT_AVATAR_SRC}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
            />
            <button
              type="button"
              onClick={() => setUpdateImageOpen(true)}
              className="cursor-pointer absolute bottom-0 right-0 px-2 py-1 text-xs font-medium rounded bg-blue-950 text-white hover:bg-blue-950/90 uppercase tracking-wider shadow"
            >
              update image
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Name" value={userName} onChange={setUserName} />
          <Field label="Surnames" value={userSurnames} onChange={setUserSurnames} />
        </div>

        <Field
          label="User description"
          value={userDescription}
          onChange={setUserDescription}
          multiline
        />

        <div className="mb-4">
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
          label="Current position"
          value={currentCompanyPosition}
          onChange={setCurrentCompanyPosition}
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
            Experience
          </label>
          <div className="space-y-4">
            {(user.experienceArray ?? []).map((item, index) => (
              <ExperienceCard key={index} item={item} />
            ))}
          </div>
        </div>

        {dirty && (
          <button
            type="button"
            onClick={handleUpdateChanges}
            disabled={saving}
            className="fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-lg bg-blue-950 hover:bg-blue-950/90 disabled:opacity-60 text-white font-medium uppercase tracking-wider z-50"
          >
            {saving ? "Guardando…" : "Update changes"}
          </button>
        )}
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
