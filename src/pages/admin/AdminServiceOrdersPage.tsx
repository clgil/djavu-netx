import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, FileText, Printer } from "lucide-react";
import { useState } from "react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from "@/lib/types";
import { formatCUP } from "@/lib/currency";

export default function AdminServiceOrdersPage() {
  const [search, setSearch] = useState("");
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<any>(null);

  const { data: serviceOrders, isLoading } = useQuery({
    queryKey: ["admin-service-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_orders")
        .select(`
          *,
          order:orders(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredOrders = serviceOrders?.filter((so) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      so.service_order_number.toLowerCase().includes(searchLower) ||
      so.customer_name.toLowerCase().includes(searchLower) ||
      so.customer_email?.toLowerCase().includes(searchLower) ||
      so.customer_phone?.toLowerCase().includes(searchLower)
    );
  });

  const handlePrint = (serviceOrder: any) => {
    // Create print window with service order details
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const specs = serviceOrder.technical_specifications;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orden de Servicio - ${serviceOrder.service_order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #5c4033; border-bottom: 2px solid #5c4033; padding-bottom: 10px; }
          h2 { color: #5c4033; margin-top: 30px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; }
          .info-box h3 { margin: 0 0 10px 0; color: #333; }
          .info-box p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #5c4033; color: white; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          .qr-placeholder { width: 100px; height: 100px; border: 1px dashed #999; display: flex; align-items: center; justify-content: center; color: #999; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Djavu</h1>
            <p>Orden de Servicio: <strong>${serviceOrder.service_order_number}</strong></p>
          </div>
          <div class="qr-placeholder">QR Code</div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>Datos del Cliente</h3>
            <p><strong>Nombre:</strong> ${serviceOrder.customer_name}</p>
            <p><strong>Teléfono:</strong> ${serviceOrder.customer_phone || "N/A"}</p>
            <p><strong>Email:</strong> ${serviceOrder.customer_email || "N/A"}</p>
          </div>
          <div class="info-box">
            <h3>Información del Pedido</h3>
            <p><strong>Fecha:</strong> ${new Date(serviceOrder.created_at).toLocaleDateString("es-ES")}</p>
            <p><strong>Días estimados:</strong> ${serviceOrder.estimated_production_days} días</p>
            <p><strong>Estado:</strong> ${ORDER_STATUS_LABELS[serviceOrder.order?.status as OrderStatus] || "N/A"}</p>
          </div>
        </div>

        <h2>Especificaciones Técnicas</h2>
        <table>
          <tr>
            <th>Concepto</th>
            <th>Detalle</th>
          </tr>
          ${specs?.items?.map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>
                ${item.dimensions ? `Dimensiones: ${item.dimensions}<br>` : ""}
                ${item.wood ? `Madera: ${item.wood}<br>` : ""}
                ${item.finish ? `Acabado: ${item.finish}<br>` : ""}
                ${item.extras?.length ? `Extras: ${item.extras.join(", ")}<br>` : ""}
                Cantidad: ${item.quantity}
              </td>
            </tr>
          `).join("") || "<tr><td colspan='2'>Sin especificaciones</td></tr>"}
        </table>

        <h2>Resumen Financiero</h2>
        <div class="info-grid">
          <div class="info-box">
            <p><strong>Precio Total:</strong> $${serviceOrder.total_price.toFixed(2)} CUP</p>
            <p><strong>Anticipo Pagado:</strong> $${serviceOrder.deposit_paid.toFixed(2)} CUP</p>
            <p><strong>Saldo Pendiente:</strong> $${serviceOrder.remaining_balance.toFixed(2)} CUP</p>
          </div>
        </div>

        ${serviceOrder.production_notes ? `
          <h2>Notas de Producción</h2>
          <p>${serviceOrder.production_notes}</p>
        ` : ""}

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Órdenes de Servicio</h2>
        <p className="text-muted-foreground">Documentación técnica para producción</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Servicio ({filteredOrders?.length || 0})</CardTitle>
          <CardDescription>Documentación generada automáticamente al pagar el anticipo</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No hay órdenes de servicio aún</p>
              <p className="text-sm text-muted-foreground mt-1">
                Las órdenes se generan automáticamente cuando un cliente paga el anticipo
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Orden</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado Pedido</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders?.map((so) => (
                    <TableRow key={so.id}>
                      <TableCell className="font-medium">{so.service_order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p>{so.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{so.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(so.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {formatCUP(Number(so.total_price))}
                      </TableCell>
                      <TableCell>
                        <Badge className={ORDER_STATUS_COLORS[so.order?.status as OrderStatus]}>
                          {ORDER_STATUS_LABELS[so.order?.status as OrderStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedServiceOrder(so)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrint(so)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Order Detail Dialog */}
      <Dialog open={!!selectedServiceOrder} onOpenChange={() => setSelectedServiceOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Orden de Servicio {selectedServiceOrder?.service_order_number}</DialogTitle>
            <DialogDescription>
              Documento técnico para producción
            </DialogDescription>
          </DialogHeader>

          {selectedServiceOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Cliente</h4>
                  <div className="text-sm space-y-1 p-4 bg-muted/50 rounded-lg">
                    <p><strong>Nombre:</strong> {selectedServiceOrder.customer_name}</p>
                    <p><strong>Teléfono:</strong> {selectedServiceOrder.customer_phone || "N/A"}</p>
                    <p><strong>Email:</strong> {selectedServiceOrder.customer_email || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Producción</h4>
                  <div className="text-sm space-y-1 p-4 bg-muted/50 rounded-lg">
                    <p><strong>Días estimados:</strong> {selectedServiceOrder.estimated_production_days}</p>
                    <p><strong>Estado:</strong> {ORDER_STATUS_LABELS[selectedServiceOrder.order?.status as OrderStatus]}</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-2">
                <h4 className="font-medium">Resumen Financiero</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">
                      {formatCUP(Number(selectedServiceOrder.total_price))}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Anticipo Pagado</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCUP(Number(selectedServiceOrder.deposit_paid))}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                    <p className="text-xl font-bold text-orange-600">
                      {formatCUP(Number(selectedServiceOrder.remaining_balance))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Specs */}
              <div className="space-y-2">
                <h4 className="font-medium">Especificaciones Técnicas</h4>
                <pre className="text-sm p-4 bg-muted/50 rounded-lg overflow-x-auto">
                  {JSON.stringify(selectedServiceOrder.technical_specifications, null, 2)}
                </pre>
              </div>

              {/* Production Notes */}
              {selectedServiceOrder.production_notes && (
                <div className="space-y-2">
                  <h4 className="font-medium">Notas de Producción</h4>
                  <p className="text-sm p-4 bg-muted/50 rounded-lg">
                    {selectedServiceOrder.production_notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handlePrint(selectedServiceOrder)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" onClick={() => setSelectedServiceOrder(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
