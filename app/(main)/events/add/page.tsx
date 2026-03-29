import type { Metadata } from "next";
import AddEventContent from "./AddEventContent";

export const metadata: Metadata = {
  title: "Add your event | Events | GlassInformer",
  description:
    "List an industry event on GlassInformer — an account is required.",
};

export default function AddEventPage() {
  return <AddEventContent />;
}
