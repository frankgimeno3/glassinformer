"use client";

import React, { FC, useState, useEffect, useMemo } from "react";
import Link from "next/link";

const DEFAULT_AVATAR_SRC = "https://source.unsplash.com/WMRI9HvAwV4/256x256";

interface UserCard {
  id_user: string;
  userName: string;
  userSurnames: string;
  userDescription: string;
  userMainImageSrc: string;
  userCurrentCompany?: { id_company: string; userPosition: string };
}

const UserCard: FC<{ user: UserCard }> = ({ user }) => (
  <Link
    href={`/logged/profiles/${encodeURIComponent(user.id_user)}`}
    className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
  >
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-shrink-0 flex justify-center sm:justify-start">
        <img
          src={user.userMainImageSrc || DEFAULT_AVATAR_SRC}
          alt={`${user.userName} ${user.userSurnames}`}
          className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
        />
      </div>
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <h3 className="font-serif font-bold text-gray-900 lowercase">
          {user.userName} {user.userSurnames}
        </h3>
        {user.userCurrentCompany?.userPosition ? (
          <p className="text-sm text-gray-500 mt-0.5">{user.userCurrentCompany.userPosition}</p>
        ) : null}
        {user.userDescription ? (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{user.userDescription}</p>
        ) : null}
      </div>
    </div>
  </Link>
);

const ProfilesList: FC = () => {
  const [users, setUsers] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/v1/users", { credentials: "include" });
        if (!res.ok) {
          setError("Error al cargar los perfiles.");
          setUsers([]);
          return;
        }
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("Error al cargar los perfiles.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.userName ?? "").toLowerCase().includes(q) ||
        (u.userSurnames ?? "").toLowerCase().includes(q) ||
        (u.id_user ?? "").toLowerCase().includes(q) ||
        (u.userDescription ?? "").toLowerCase().includes(q) ||
        (u.userCurrentCompany?.userPosition ?? "").toLowerCase().includes(q)
    );
  }, [users, filter]);

  if (loading) {
    return (
      <div className="p-6 text-gray-600 text-center">
        <p>Cargando perfiles…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-gray-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-serif font-bold text-gray-900 lowercase">
            perfiles
          </h1>
          <Link
            href="/logged/profiles/me"
            className="text-sm text-blue-950 hover:underline uppercase tracking-wider"
          >
            Mi perfil
          </Link>
        </div>

        <div className="mb-6">
          <label htmlFor="profiles-filter" className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
            Filtrar por nombre, apellidos, email o descripción
          </label>
          <input
            id="profiles-filter"
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Escribe para filtrar…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {filter.trim() ? "Ningún perfil coincide con el filtro." : "No hay perfiles."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <UserCard key={user.id_user} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilesList;
