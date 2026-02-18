import type { ReactNode } from "react";
import type { Metadata } from "next";
import "@/index.css";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Djavu | Muebles personalizados",
  description: "Tienda de muebles personalizados con checkout, seguimiento de pedidos y panel administrativo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
