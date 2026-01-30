"use client";

import React, { FC, useState, useEffect, useCallback } from "react";
import { DEFAULT_USER_ID } from "../constants";
import usersData from "../../contents/usersData.json";
import companiesContents from "../../contents/companiesContents.json";
import UpdateImageModal from "./profileComponents/UpdateImageModal";
import CompanyAddEditModal from "./profileComponents/CompanyAddEditModal";

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

function getCompanyNameById(id: string): string {
  const list = companiesContents as CompanyEntry[];
  const found = list.find((c) => c.id_company === id);
  return found?.company_name ?? id;
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

  useEffect(() => {
    const data = usersData as UserData[];
    const found = data.find((u) => u.id_user === DEFAULT_USER_ID);
    if (found) {
      setUser(found);
      setUserName(found.userName);
      setUserSurnames(found.userSurnames);
      setUserDescription(found.userDescription);
      setUserMainImageSrc(found.userMainImageSrc);
      setCurrentCompanyId(found.userCurrentCompany?.id_company ?? "");
      setCurrentCompanyPosition(found.userCurrentCompany?.userPosition ?? "");
    }
  }, []);

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

  const handleUpdateChanges = () => {
    window.location.reload();
  };

  const handleImageConfirm = useCallback((newUrl: string) => {
    setUserMainImageSrc(newUrl);
  }, []);

  const handleNoLongerWorkHere = useCallback(() => {
    setCurrentCompanyId("");
  }, []);

  if (!user) {
    return (
      <div className="p-6 text-gray-600">
        <p>User not found.</p>
      </div>
    );
  }

  const currentCompanyName = currentCompanyId
    ? getCompanyNameById(currentCompanyId)
    : "";

  return (
    <div className="bg-white">
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center lowercase">
          my profile
        </h1>

        <div className="mb-6 flex justify-center">
          <div className="relative inline-block">
            <img
              src={userMainImageSrc}
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
            className="fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-lg bg-blue-950 hover:bg-blue-950/90 text-white font-medium uppercase tracking-wider z-50"
          >
            Update changes
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
