import type { Metadata } from "next";
import AddCompanyContent from "./AddCompanyContent";

export const metadata: Metadata = {
  title: "Create company | Directory | GlassInformer",
  description:
    "Create a company listing in the GlassInformer directory — account required.",
};

export default function AddCompanyPage() {
  return <AddCompanyContent />;
}
