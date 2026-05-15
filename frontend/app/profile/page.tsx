import { Suspense } from "react";
import ProfileClient from "@/components/auth/ProfileClient";
export default function ProfilePage() {
  return <Suspense><ProfileClient /></Suspense>;
}
