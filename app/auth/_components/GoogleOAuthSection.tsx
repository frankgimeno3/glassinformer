"use client";

import type { FC, ReactNode } from "react";
import { AUTH_AUX_TEXT, AUTH_PRIMARY_BUTTON } from "./authFormStyles";

const AUTH_DIVIDER_ROW = "flex items-center gap-3 py-1";
const AUTH_DIVIDER_LINE = "h-px flex-1 bg-gray-600";
const AUTH_OAUTH_BUTTON =
  "flex w-full items-center justify-center gap-3 rounded-lg border border-gray-600 bg-black/40 px-4 py-3 text-base font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50";

function GoogleMark() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.1-.9 2.1-1.9 2.7l3 2.3c1.8-1.6 2.8-4 2.8-6.8 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.4 0 4.5-.8 6-2.2l-3-2.3c-.8.5-1.8.9-3 .9-2.3 0-4.3-1.6-5-3.7H4v2.4C5.5 20.1 8.6 22 12 22z"
      />
      <path
        fill="#4A90E2"
        d="M7 13.1c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7H4c-.8 1.6-1.2 3.4-1.2 5.1 0 1.8.4 3.5 1.2 5.1l3-2.1z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.4c1.3 0 2.5.4 3.4 1.2l2.6-2.6C16.5 2.3 14.4 1.5 12 1.5 8.6 1.5 5.5 3.4 4 6.4l3 2.4c.7-2.1 2.7-3.4 5-3.4z"
      />
    </svg>
  );
}

type GoogleOAuthSectionProps = {
  buttonLabel: string;
  onGoogleClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  /** Extra content below the button (e.g. links) */
  children?: ReactNode;
};

export const GoogleOAuthSection: FC<GoogleOAuthSectionProps> = ({
  buttonLabel,
  onGoogleClick,
  disabled = false,
  loading = false,
  error = null,
  children,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className={AUTH_DIVIDER_ROW}>
        <span className={AUTH_DIVIDER_LINE} />
        <span className={`${AUTH_AUX_TEXT} shrink-0 text-xs uppercase tracking-wide text-gray-400`}>
          o continuar con
        </span>
        <span className={AUTH_DIVIDER_LINE} />
      </div>

      <button
        type="button"
        className={AUTH_OAUTH_BUTTON}
        onClick={() => void onGoogleClick()}
        disabled={disabled || loading}
        aria-busy={loading}
      >
        <GoogleMark />
        {loading ? "Conectando…" : buttonLabel}
      </button>

      {error ? (
        <div className="text-center text-sm text-red-400" role="alert">
          {error}
        </div>
      ) : null}

      {children}
    </div>
  );
};

export const GoogleOAuthFallbackLink: FC<{ href: string; label: string }> = ({ href, label }) => (
  <a href={href} className={`${AUTH_PRIMARY_BUTTON} block text-center text-sm`}>
    {label}
  </a>
);
