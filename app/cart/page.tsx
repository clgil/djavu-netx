import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import CartPage from "@/pages/CartPage";

export const metadata: Metadata = { title: "Carrito | Djavu", description: "Gestiona los productos de tu carrito antes de finalizar la compra." };

export default function Page() { return <MainLayout><CartPage /></MainLayout>; }
