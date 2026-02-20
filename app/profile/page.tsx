import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import ProfilePage from "@/pages/ProfilePage";

export const metadata: Metadata = { title: "Perfil | Djavu", description: "Administra tus datos personales y dirección de envío." };

export default function Page() { return <MainLayout><ProfilePage /></MainLayout>; }
