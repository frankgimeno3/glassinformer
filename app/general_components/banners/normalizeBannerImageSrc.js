function safeDecodeRepeated(value) {
  let current = value;
  for (let i = 0; i < 5; i += 1) {
    let decoded;
    try {
      decoded = decodeURIComponent(current);
    } catch {
      break;
    }
    if (decoded === current) break;
    current = decoded;
  }
  return current;
}

function normalizePathname(pathname) {
  if (!pathname) return pathname;
  return pathname
    .split("/")
    .map((segment) => encodeURIComponent(safeDecodeRepeated(segment)))
    .join("/");
}

export function normalizeBannerImageSrc(src) {
  const raw = String(src ?? "").trim();
  if (!raw) return "/file.svg";
  if (raw.startsWith("data:")) return raw;

  const normalizedInput =
    /^(https?:)?\/\//i.test(raw) || raw.startsWith("/") ? raw : `https://${raw}`;

  try {
    const url = new URL(normalizedInput, "http://localhost");
    const normalizedPathname = normalizePathname(url.pathname);
    const normalized =
      url.origin === "http://localhost" && normalizedInput.startsWith("/")
        ? `${normalizedPathname}${url.search}${url.hash}`
        : `${url.protocol}//${url.host}${normalizedPathname}${url.search}${url.hash}`;
    return normalized;
  } catch {
    return normalizedInput;
  }
}
