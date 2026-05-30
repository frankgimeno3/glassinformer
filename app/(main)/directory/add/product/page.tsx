import type { Metadata } from "next";
import AddProductContent from "./AddProductContent";

export const metadata: Metadata = {
  title: "Request product creation | Directory | GlassInformer",
  description:
    "Request product creation in the GlassInformer directory — employee relation and portal approval required.",
};

export default function AddProductPage() {
  return <AddProductContent />;
}
