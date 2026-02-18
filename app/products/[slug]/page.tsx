import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import ProductDetailPage from "@/pages/ProductDetailPage";

export const metadata: Metadata = { title: "Detalle de producto | Djavu", description: "Ficha completa del producto, especificaciones y productos relacionados." };

export default function Page() {
  return <MainLayout><ProductDetailPage /></MainLayout>;
}
