"use client";

import React, { FC, useState } from "react";
import Link from "next/link";
import JoinRequestModal, { CompanyOption } from "./joinComponents/JoinRequestModal";
import CompaniesJoinDirectoryTable, {
  JoinDirectoryCompany,
} from "./joinComponents/CompaniesJoinDirectoryTable";
import Reveal from "@/app/general_components/motion/Reveal";

const JoinCompany: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);

  const openModal = (company: JoinDirectoryCompany) => {
    setSelectedCompany({
      id_company: company.id_company,
      company_name: company.company_name,
      main_description: company.main_description || "",
    });
    setModalOpen(true);
  };

  const handleConfirm = (description: string) => {
    console.log("Join request:", { company: selectedCompany, description });
    setModalOpen(false);
    setSelectedCompany(null);
  };

  return (
    <div className="w-full bg-white">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-12 sm:pt-16">
        <Reveal delayMs={0}>
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight">
              Join company
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Browse companies in our directory and send a request to join as a member.
            </p>
          </div>
        </Reveal>

        <Reveal delayMs={120}>
          <CompaniesJoinDirectoryTable onSendJoinRequest={openModal} />
        </Reveal>

        <Reveal delayMs={150}>
          <div className="mt-8">
            <Link
              href="/logged/companies"
              className="text-blue-950 hover:underline uppercase tracking-wider text-sm"
            >
              ← Back to My companies
            </Link>
          </div>
        </Reveal>
      </div>

      <JoinRequestModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default JoinCompany;
