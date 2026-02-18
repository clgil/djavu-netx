import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Truck,
  Check,
  Clock,
  FileText,
  Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  Order,
  OrderItem,
  ServiceOrder,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  OrderStatus,
  FURNITURE_TYPE_LABELS,
} from "@/lib/types";
import { formatCUP } from "@/lib/currency";

const statusSteps: OrderStatus[] = [
  "quote_generated",
  "deposit_paid",
  "in_production",
  "manufactured",
  "ready_for_delivery",
  "delivered",
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) throw orderError;

      const { data: items } = await supabase
        .from("order_items")
        .select(`
          *,
          product:products(*),
          custom_wood_type:wood_types!order_items_custom_wood_type_id_fkey(*),
          custom_finish:finishes!order_items_custom_finish_id_fkey(*)
        `)
        .eq("order_id", id);

      const { data: serviceOrder } = await supabase
        .from("service_orders")
        .select("*")
        .eq("order_id", id)
        .single();

      return {
        ...orderData,
        items: items || [],
        service_order: serviceOrder,
      } as Order & { items: OrderItem[]; service_order: ServiceOrder | null };
    },
    enabled: !!id && !!user,
  });

  if (!user) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Por favor, inicia sesión para ver este pedido.</p>
        <Button asChild className="mt-4">
          <Link to="/auth">Iniciar Sesión</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-12 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-serif text-3xl font-bold mb-2">Pedido No Encontrado</h1>
        <Button asChild className="mt-4">
          <Link to="/orders">Volver a Pedidos</Link>
        </Button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-bold">{order.order_number}</h1>
            <p className="text-muted-foreground">
              Realizado el{" "}
              {new Date(order.created_at).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Badge className={`ml-auto ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>

        {/* Status Timeline */}
        {order.status !== "cancelled" && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {statusSteps.map((status, index) => (
                  <div key={status} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index <= currentStepIndex
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index < currentStepIndex ? (
                          <Check className="h-5 w-5" />
                        ) : index === currentStepIndex ? (
                          <Clock className="h-5 w-5" />
                        ) : (
                          <span className="text-sm">{index + 1}</span>
                        )}
                      </div>
                      <span className="text-xs mt-2 text-center hidden sm:block">
                        {ORDER_STATUS_LABELS[status]}
                      </span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`w-8 sm:w-16 h-1 mx-1 ${
                          index < currentStepIndex ? "bg-accent" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Artículos del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-muted rounded-lg"
                    >
                      <div className="w-16 h-16 bg-background rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">
                          {item.is_custom ? "🛠️" : "🪑"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {item.is_custom
                            ? `${FURNITURE_TYPE_LABELS[item.custom_furniture_type!]} Personalizado`
                            : item.product?.name}
                        </h4>
                        {item.is_custom && (
                          <div className="text-sm text-muted-foreground">
                            <p>
                              {item.custom_wood_type?.name} •{" "}
                              {item.custom_finish?.name}
                            </p>
                            <p>
                              {item.custom_length}×{item.custom_width}×
                              {item.custom_height} cm
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Cant: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCUP(item.total_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Datos de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{order.shipping_name}</p>
                  <p className="text-muted-foreground">{order.shipping_address}</p>
                  <p className="text-muted-foreground">
                    {order.shipping_city}, {order.shipping_postal_code}
                  </p>
                  <p className="text-muted-foreground">{order.shipping_country}</p>
                  <p className="text-muted-foreground">{order.shipping_phone}</p>
                </div>
                {order.estimated_delivery_date && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm">
                      <strong>Entrega Estimada:</strong>{" "}
                      {new Date(order.estimated_delivery_date).toLocaleDateString(
                        "es-ES",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCUP(order.subtotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Anticipo (50%)</span>
                    <span
                      className={order.deposit_paid ? "text-accent" : "text-destructive"}
                    >
                      {formatCUP(order.deposit_amount)}
                      {order.deposit_paid ? " ✓" : " (Pendiente)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saldo Pendiente</span>
                    <span
                      className={order.balance_paid ? "text-accent" : ""}
                    >
                      {formatCUP(order.remaining_balance)}
                      {order.balance_paid && " ✓"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCUP(order.subtotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.service_order && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Orden de Servicio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Orden de Servicio #{order.service_order.service_order_number}
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
