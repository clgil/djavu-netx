import type { Metadata } from "next";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";

export const metadata: Metadata = { title: "Admin Pedidos | Djavu", description: "Gestión completa de pedidos desde el panel admin." };

export default function Page() { return <AdminOrdersPage />; }
