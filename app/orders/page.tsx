import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import OrdersPage from "@/pages/OrdersPage";

export const metadata: Metadata = { title: "Mis pedidos | Djavu", description: "Consulta el estado y detalle de tus pedidos." };

export default function Page() { return <MainLayout><OrdersPage /></MainLayout>; }
