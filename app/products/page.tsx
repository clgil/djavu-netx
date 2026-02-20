import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import ProductsPage from "@/pages/ProductsPage";

export const metadata: Metadata = { title: "Productos | Djavu", description: "Explora el catálogo completo de muebles estándar y personalizados." };

export default function Page() {
  return <MainLayout><ProductsPage /></MainLayout>;
}
