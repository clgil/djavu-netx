import type { Metadata } from "next";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";

export const metadata: Metadata = { title: "Admin Dashboard | Djavu", description: "Panel principal de administración con métricas y atajos." };

export default function Page() { return <AdminDashboardPage />; }
