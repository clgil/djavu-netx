import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import AboutPage from "@/pages/AboutPage";

export const metadata: Metadata = { title: "Sobre Djavu", description: "Historia, misión y valores de la marca Djavu." };

export default function Page() { return <MainLayout><AboutPage /></MainLayout>; }
