"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/types";
import { formatCUP } from "@/lib/currency";

export default function OrdersPage() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container py-12 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-serif text-3xl font-bold mb-2">Inicio de Sesión Requerido</h1>
        <p className="text-muted-foreground mb-6">
          Por favor, inicia sesión para ver tus pedidos.
        </p>
        <Button asChild>
          <Link href="/auth">Iniciar Sesión</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <h1 className="font-serif text-3xl font-bold mb-8">Mis Pedidos</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold mb-2">Aún No Tienes Pedidos</h1>
          <p className="text-muted-foreground mb-6">
            Todavía no has realizado ningún pedido. ¡Empieza a comprar!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/products">Ver Productos</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/customize">Diseñar Pieza Personalizada</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-serif text-3xl font-bold mb-8">Mis Pedidos</h1>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {order.order_number}
                        </h3>
                        <Badge
                          className={ORDER_STATUS_COLORS[order.status]}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Realizado el{" "}
                        {new Date(order.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>
                          Total: <strong>{formatCUP(order.subtotal)}</strong>
                        </span>
                        {order.deposit_paid ? (
                          <span className="text-accent">Anticipo Pagado ✓</span>
                        ) : (
                          <span className="text-destructive">Anticipo Pendiente</span>
                        )}
                      </div>
                      {order.estimated_delivery_date && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Entrega Estimada:{" "}
                          {new Date(order.estimated_delivery_date).toLocaleDateString(
                            "es-ES",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                    </div>
                    <Button asChild>
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
