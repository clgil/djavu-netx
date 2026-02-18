import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import HowItWorksPage from "@/pages/HowItWorksPage";

export const metadata: Metadata = { title: "Cómo funciona | Djavu", description: "Conoce el proceso de diseño, fabricación y entrega de Djavu." };

export default function Page() { return <MainLayout><HowItWorksPage /></MainLayout>; }
