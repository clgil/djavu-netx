import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import ContactPage from "@/pages/ContactPage";

export const metadata: Metadata = { title: "Contacto | Djavu", description: "Contáctanos para dudas sobre pedidos, personalización y soporte." };

export default function Page() { return <MainLayout><ContactPage /></MainLayout>; }
