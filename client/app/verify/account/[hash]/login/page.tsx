import { redirect } from "next/navigation";

export default function LegacyLoginVerificationPage() {
  redirect("/forgot-password");
}
