"use client";
import { FC, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AuthenticationService from "@/apiClient/AuthenticationService";
import LoggedNav from "./LoggedNav";
import UnloggedNav from "./UnloggedNav";

const AppNav: FC = () => {
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    AuthenticationService.isAuthenticated().then(setIsLogged);
  }, [pathname]);

  if (isLogged === null) {
    return (
      <nav className="flex flex-col shadow-xl bg-white border-b w-full">
        <header className="flex flex-row justify-between border-b border-gray-200 py-8 px-4 w-full px-4 sm:px-6 lg:px-12 animate-pulse">
          <div className="h-14 w-48 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </header>
      </nav>
    );
  }

  return isLogged ? <LoggedNav /> : <UnloggedNav />;
};

export default AppNav;
