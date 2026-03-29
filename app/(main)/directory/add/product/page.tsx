import type { Metadata } from "next";
import AddProductContent from "./AddProductContent";

export const metadata: Metadata = {
  title: "Create product | Directory | GlassInformer",
  description:
    "Create a product in the GlassInformer directory — company and account required.",
};

export default function AddProductPage() {
  return <AddProductContent />;
}
