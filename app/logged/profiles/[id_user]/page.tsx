"use client";

import React, { FC, useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CompanyService } from "@/apiClient/CompanyService";

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

/** Default avatar when user has no image URL (Unsplash: black & white street sign – WMRI9HvAwV4) */
const DEFAULT_AVATAR_SRC = "https://source.unsplash.com/WMRI9HvAwV4/256x256";

const ExperienceCard: FC<{ item: ExperienceItem }> = ({ item }) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
    <p className="font-bold text-gray-900">{item["company name"]}</p>
    <p className="text-gray-400 text-sm mt-1">{item.from} – {item.to}</p>
    <p className="text-gray-700 mt-2">{item.position}</p>
    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{item.description}</p>
  </div>
);

const ReadOnlyField: FC<{ label: string; value: string; multiline?: boolean }> = ({
  label,
  value,
  multiline,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
      {label}
    </label>
    {multiline ? (
      <p className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 whitespace-pre-wrap min-h-[80px]">
        {value || "—"}
      </p>
    ) : (
      <p className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
        {value || "—"}
      </p>
    )}
  </div>
);

const UserProfileView: FC = () => {
  const params = useParams();
  const id_user = typeof params.id_user === "string" ? params.id_user : params.id_user?.[0] ?? "";
  const [user, setUser] = useState<UserData | null>(null);
  const [companiesList, setCompaniesList] = useState<CompanyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id_user) {
      setLoading(false);
      setError("ID de usuario no válido.");
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/users/${encodeURIComponent(id_user)}`, {
          credentials: "include",
        });
        if (res.status === 404) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || "Usuario no encontrado.");
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
      } catch (e) {
        console.error(e);
        setError("Error al cargar el perfil.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id_user]);

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
      } catch {
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
        <p>{error || "Usuario no encontrado."}</p>
        <Link href="/logged/profiles/me" className="mt-2 inline-block text-blue-950 underline">
          Volver a mi perfil
        </Link>
        <Link href="/logged/profiles" className="mt-2 ml-4 inline-block text-blue-950 underline">
          Ver todos los perfiles
        </Link>
      </div>
    );
  }

  const currentCompanyName = user.userCurrentCompany?.id_company
    ? getCompanyNameById(user.userCurrentCompany.id_company)
    : "";

  return (
    <div className="bg-white">
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif font-bold text-gray-900 lowercase">
            perfil
          </h1>
          <div className="flex gap-4">
            <Link
              href="/logged/profiles"
              className="text-sm text-blue-950 hover:underline uppercase tracking-wider"
            >
              Perfiles
            </Link>
            <Link
              href="/logged/profiles/me"
              className="text-sm text-blue-950 hover:underline uppercase tracking-wider"
            >
              Mi perfil
            </Link>
          </div>
        </div>

        <div className="mb-6 flex justify-center">
          <img
            src={user.userMainImageSrc || DEFAULT_AVATAR_SRC}
            alt={`${user.userName} ${user.userSurnames}`}
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <ReadOnlyField label="Name" value={user.userName ?? ""} />
          <ReadOnlyField label="Surnames" value={user.userSurnames ?? ""} />
        </div>

        <ReadOnlyField
          label="User description"
          value={user.userDescription ?? ""}
          multiline
        />

        <ReadOnlyField
          label="Current company"
          value={currentCompanyName}
        />

        <ReadOnlyField
          label="Current position"
          value={user.userCurrentCompany?.userPosition ?? ""}
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
            Experience
          </label>
          <div className="space-y-4">
            {(user.experienceArray ?? []).length === 0 ? (
              <p className="text-gray-500 text-sm">—</p>
            ) : (
              (user.experienceArray ?? []).map((item, index) => (
                <ExperienceCard key={index} item={item} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
