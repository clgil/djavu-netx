"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Truck, Check, Clock, FileText, Download, ReceiptText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Order, OrderItem, ServiceOrder, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus, FURNITURE_TYPE_LABELS } from "@/lib/types";
import { formatCUP } from "@/lib/currency";
import { downloadPdfBlob } from "@/lib/pdf";

const statusSteps: OrderStatus[] = ["quote_generated", "deposit_paid", "in_production", "manufactured", "ready_for_delivery", "delivered"];

function base64ToPdfBlob(base64: string) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: "application/pdf" });
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data: orderData, error: orderError } = await supabase.from("orders").select("*").eq("id", id).single();
      if (orderError) throw orderError;

      const { data: items } = await supabase
        .from("order_items")
        .select(`*, product:products(*), custom_wood_type:wood_types!order_items_custom_wood_type_id_fkey(*), custom_finish:finishes!order_items_custom_finish_id_fkey(*)`)
        .eq("order_id", id);

      const { data: serviceOrder } = await supabase.from("service_orders").select("*").eq("order_id", id).maybeSingle();
      const { data: invoice } = await supabase.from("invoices").select("*").eq("order_id", id).maybeSingle();

      return { ...orderData, items: items || [], service_order: serviceOrder, invoice } as Order & { items: OrderItem[]; service_order: ServiceOrder | null; invoice?: any };
    },
    enabled: !!id && !!user,
  });

  const downloadServiceOrder = () => {
    const base64 = order?.service_order?.technical_specifications?.service_order_pdf_base64 as string | undefined;
    if (!base64) return;
    downloadPdfBlob(base64ToPdfBlob(base64), `service-order-${order?.order_number}.pdf`);
  };

  const downloadInvoice = () => {
    const base64 = order?.invoice?.items_detail?.invoice_pdf_base64 as string | undefined;
    if (!base64) return;
    downloadPdfBlob(base64ToPdfBlob(base64), `invoice-${order?.order_number}.pdf`);
  };

  if (!user) {
    return <div className="container py-12 text-center"><p className="text-muted-foreground">Por favor, inicia sesión para ver este pedido.</p><Button asChild className="mt-4"><Link href="/auth">Iniciar Sesión</Link></Button></div>;
  }

  if (isLoading) return <div className="container py-12"><Skeleton className="h-10 w-48 mb-8" /><Skeleton className="h-96 w-full" /></div>;

  if (!order) return <div className="container py-12 text-center"><Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" /><h1 className="font-serif text-3xl font-bold mb-2">Pedido No Encontrado</h1><Button asChild className="mt-4"><Link href="/orders">Volver a Pedidos</Link></Button></div>;

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild><Link href="/orders"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="font-serif text-3xl font-bold">{order.order_number}</h1>
            <p className="text-muted-foreground">Realizado el {new Date(order.created_at).toLocaleDateString("es-ES")}</p>
          </div>
          <Badge className={`ml-auto ${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</Badge>
        </div>

        {order.status !== "cancelled" && (
          <Card className="mb-8"><CardContent className="p-6"><div className="flex items-center justify-between">{statusSteps.map((status, index) => <div key={status} className="flex items-center"><div className="flex flex-col items-center"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStepIndex ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{index < currentStepIndex ? <Check className="h-5 w-5" /> : index === currentStepIndex ? <Clock className="h-5 w-5" /> : <span className="text-sm">{index + 1}</span>}</div></div>{index < statusSteps.length - 1 && <div className="w-8 sm:w-16 h-0.5 bg-border mx-2" />}</div>)}</div></CardContent></Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardHeader><CardTitle>Artículos</CardTitle></CardHeader><CardContent><div className="space-y-4">{order.items?.map((item) => <div key={item.id} className="flex gap-4 p-4 bg-muted rounded-lg"><div className="w-16 h-16 bg-background rounded flex items-center justify-center flex-shrink-0"><span className="text-2xl">{item.is_custom ? "🛠️" : "🪑"}</span></div><div className="flex-1"><h4 className="font-medium">{item.is_custom ? `${FURNITURE_TYPE_LABELS[item.custom_furniture_type!]} Personalizado` : item.product?.name}</h4>{item.is_custom && <div className="text-sm text-muted-foreground"><p>{item.custom_wood_type?.name} • {item.custom_finish?.name}</p><p>{item.custom_length}×{item.custom_width}×{item.custom_height} cm</p></div>}<p className="text-sm text-muted-foreground">Cant: {item.quantity}</p></div><div className="text-right"><p className="font-semibold">{formatCUP(item.total_price)}</p></div></div>)}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" />Datos de Envío</CardTitle></CardHeader><CardContent><p className="font-medium">{order.shipping_name}</p><p className="text-muted-foreground">{order.shipping_address}</p><p className="text-muted-foreground">{order.shipping_city}, {order.shipping_postal_code}</p><p className="text-muted-foreground">{order.shipping_phone}</p></CardContent></Card>
          </div>

          <div className="space-y-6">
            <Card><CardHeader><CardTitle>Resumen del Pedido</CardTitle></CardHeader><CardContent><div className="space-y-3"><div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCUP(order.subtotal)}</span></div><Separator /><div className="flex justify-between"><span>Anticipo</span><span>{formatCUP(order.deposit_amount)}{order.deposit_paid ? " ✓" : ""}</span></div><div className="flex justify-between"><span>Saldo Pendiente</span><span>{formatCUP(order.remaining_balance)}{order.balance_paid ? " ✓" : ""}</span></div></div></CardContent></Card>

            {order.service_order && (
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Orden de Servicio</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-4">#{order.service_order.service_order_number}</p><Button variant="outline" className="w-full" onClick={downloadServiceOrder}><Download className="h-4 w-4 mr-2" />Descargar PDF</Button></CardContent></Card>
            )}

            {order.invoice && (
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5" />Factura</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-4">#{order.invoice.invoice_number}</p><Button variant="outline" className="w-full" onClick={downloadInvoice}><Download className="h-4 w-4 mr-2" />Descargar PDF</Button></CardContent></Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
