"use client";

import React, { FC, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CompanyService } from "@/apiClient/CompanyService";

interface CompanyNotFoundViewProps {
  idCompany: string;
  isLogged: boolean;
}

const CompanyNotFoundView: FC<CompanyNotFoundViewProps> = ({ idCompany, isLogged }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    company_name: "",
    fiscal_name: "",
    tax_id: "",
    user_position: "",
    company_website: "",
    country: "",
    description: "",
  });

  const redirectUrl = `/directory/companies/${encodeURIComponent(idCompany)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await CompanyService.requestCompanyCreation({
        requested_id: idCompany,
        company_name: form.company_name.trim(),
        fiscal_name: form.fiscal_name.trim(),
        tax_id: form.tax_id.trim(),
        user_position: form.user_position.trim(),
        company_website: form.company_website.trim(),
        country: form.country.trim(),
        description: form.description.trim(),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Error sending request";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-gray-800 tracking-wide mb-6">
          Esta empresa aún no ha sido creada en la plataforma
        </h1>
        <p className="text-gray-600 text-lg mb-10">
          El perfil que buscas no existe todavía. Puedes volver al directorio o solicitar que lo creemos.
        </p>

        <button
          onClick={() => router.push("/directory")}
          className="px-8 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium tracking-wide"
        >
          ← Volver al directorio
        </button>

        <div className="mt-12 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
          >
            <span className="text-gray-700 font-medium">
              ¿Quieres crear el perfil de esta empresa?
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              {!isLogged ? (
                <div className="text-gray-700 space-y-4">
                  <p className="text-center">
                    Debes iniciar sesión con tu cuenta de Plynium o crear una cuenta para solicitar la creación del perfil.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
                      className="px-6 py-2.5 bg-blue-950 text-white rounded-lg hover:bg-blue-900 font-medium text-center"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href={`/auth/signup?redirect=${encodeURIComponent(redirectUrl)}`}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-center"
                    >
                      Crear cuenta
                    </Link>
                  </div>
                </div>
              ) : success ? (
                <p className="text-center text-gray-700 py-4">
                  Tu solicitud ha sido enviada. El equipo de la plataforma la revisará y te contactará.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Se enviarán los datos introducidos al equipo de la plataforma para crear la cuenta.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre comercial de la empresa *
                    </label>
                    <input
                      type="text"
                      value={form.company_name}
                      onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre fiscal *
                    </label>
                    <input
                      type="text"
                      value={form.fiscal_name}
                      onChange={(e) => setForm((f) => ({ ...f, fiscal_name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax ID
                    </label>
                    <input
                      type="text"
                      value={form.tax_id}
                      onChange={(e) => setForm((f) => ({ ...f, tax_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tu cargo en la empresa *
                    </label>
                    <input
                      type="text"
                      value={form.user_position}
                      onChange={(e) => setForm((f) => ({ ...f, user_position: e.target.value }))}
                      required
                      placeholder="e.g. Director comercial"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Web de la empresa
                    </label>
                    <input
                      type="url"
                      value={form.company_website}
                      onChange={(e) => setForm((f) => ({ ...f, company_website: e.target.value }))}
                      placeholder="https://"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      País de la empresa *
                    </label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción de la empresa
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                    />
                  </div>
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-blue-950 text-white rounded-lg hover:bg-blue-900 font-medium disabled:opacity-50"
                  >
                    {submitting ? "Enviando…" : "Enviar solicitud"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyNotFoundView;
