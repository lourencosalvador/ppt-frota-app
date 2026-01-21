import type { Metadata } from "next";
import OtpClient from "@/app/(public)/recuperar-senha/otp/otp-client";

export const metadata: Metadata = {
  title: "Código OTP | Frota+",
};

export default function Page() {
  return <OtpClient />;
}

