import type { Metadata } from "next";
import AuthPage from "@/pages/AuthPage";

export const metadata: Metadata = {
  title: "Registro | Djavu",
  description: "Crea tu cuenta en Djavu",
};

export default function Page() {
  return <AuthPage />;
}
