import type { Metadata } from "next";
import AuthPage from "@/pages/AuthPage";

export const metadata: Metadata = {
  title: "Login | Djavu",
  description: "Inicia sesión en Djavu",
};

export default function Page() {
  return <AuthPage />;
}
