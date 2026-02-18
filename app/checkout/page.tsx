import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import CheckoutPage from "@/pages/CheckoutPage";

export const metadata: Metadata = { title: "Checkout | Djavu", description: "Completa tu información de envío y pago para finalizar el pedido." };

export default function Page() { return <MainLayout><CheckoutPage /></MainLayout>; }
