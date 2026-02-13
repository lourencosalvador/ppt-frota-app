import type { Metadata } from "next";
import ProfileSettings from "@/components/profile-settings";

export const metadata: Metadata = { title: "Configurações | Frota+" };

export default function Page() {
  return <ProfileSettings />;
}
