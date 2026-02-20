import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import OrderDetailPage from "@/pages/OrderDetailPage";

export const metadata: Metadata = { title: "Detalle de pedido | Djavu", description: "Revisa estado, items y progreso de producción de un pedido." };

export default function Page() { return <MainLayout><OrderDetailPage /></MainLayout>; }
