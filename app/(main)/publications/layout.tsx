import PublicationsLayoutClient from "./publications_components/PublicationsLayoutClient";

export const runtime = "nodejs";

export default function PublicationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PublicationsLayoutClient>{children}</PublicationsLayoutClient>;
}
