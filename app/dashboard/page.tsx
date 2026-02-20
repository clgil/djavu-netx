import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import ProfilePage from "@/pages/ProfilePage";

export const metadata: Metadata = {
  title: "Dashboard | Djavu",
  description: "Panel de usuario",
};

export default function Page() {
  return <MainLayout><ProfilePage /></MainLayout>;
}
