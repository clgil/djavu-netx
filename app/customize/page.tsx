import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import CustomizePage from "@/pages/CustomizePage";

export const metadata: Metadata = { title: "Personalizar mueble | Djavu", description: "Diseña tu mueble personalizado con medidas, madera y acabados." };

export default function Page() { return <MainLayout><CustomizePage /></MainLayout>; }
