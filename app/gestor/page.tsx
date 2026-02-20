import type { Metadata } from "next";
import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";

export const metadata: Metadata = {
  title: "Gestor | Djavu",
  description: "Panel de gestor",
};

export default function Page() {
  return <AdminLayout><AdminDashboardPage /></AdminLayout>;
}
