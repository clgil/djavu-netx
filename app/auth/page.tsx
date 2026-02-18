import type { Metadata } from "next";
import AuthPage from "@/pages/AuthPage";

export const metadata: Metadata = { title: "Autenticación | Djavu", description: "Inicia sesión o crea tu cuenta en Djavu." };

export default function Page() { return <AuthPage />; }
