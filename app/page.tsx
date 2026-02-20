import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import HomePage from "@/pages/HomePage";

export const metadata: Metadata = { title: "Inicio | Djavu", description: "Muebles de alta calidad, personalizados y hechos a medida." };

export default function Page() {
  return <MainLayout><HomePage /></MainLayout>;
}
