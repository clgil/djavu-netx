"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
import { Search, Eye, ChevronRight } from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus, FURNITURE_TYPE_LABELS, FurnitureType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { formatCUP } from "@/lib/currency";

const STATUS_FLOW: OrderStatus[] = [
  "quote_generated",
  "deposit_paid",
  "in_production",
  "manufactured",
  "ready_for_delivery",
  "delivered",
];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select(`
          *,
          items:order_items(
            *,
            product:products(*),
            custom_wood_type:wood_types(*),
            custom_finish:finishes(*)
          ),
          service_order:service_orders(*)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as OrderStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast({
        title: "Estado actualizado",
        description: "El estado del pedido se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido.",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = orders?.filter((order) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.shipping_name?.toLowerCase().includes(searchLower) ||
      order.shipping_phone?.toLowerCase().includes(searchLower)
    );
  });

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[currentIndex + 1];
  };

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus) {
      updateStatusMutation.mutate({ orderId, newStatus: nextStatus });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestión de Pedidos</h2>
        <p className="text-muted-foreground">Administra todos los pedidos de clientes</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, nombre o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos ({filteredOrders?.length || 0})</CardTitle>
          <CardDescription>Lista de todos los pedidos del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No se encontraron pedidos
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Anticipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders?.map((order) => {
                    const nextStatus = getNextStatus(order.status as OrderStatus);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <p>{order.shipping_name || "Sin nombre"}</p>
                            <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          {formatCUP(Number(order.subtotal))}
                        </TableCell>
                        <TableCell>
                          {order.deposit_paid ? (
                            <span className="text-green-600 font-medium">
                              {formatCUP(Number(order.deposit_amount))}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Pendiente</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={ORDER_STATUS_COLORS[order.status as OrderStatus]}>
                            {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {nextStatus && order.status !== "cancelled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdvanceStatus(order.id, order.status as OrderStatus)}
                                disabled={updateStatusMutation.isPending}
                              >
                                <ChevronRight className="h-4 w-4 mr-1" />
                                {ORDER_STATUS_LABELS[nextStatus]}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Información completa del pedido
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status and Payment */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Estado</h4>
                  <Badge className={ORDER_STATUS_COLORS[selectedOrder.status as OrderStatus]}>
                    {ORDER_STATUS_LABELS[selectedOrder.status as OrderStatus]}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Pago</h4>
                  <div className="text-sm space-y-1">
                    <p>Total: {formatCUP(Number(selectedOrder.subtotal))}</p>
                    <p>Anticipo: {formatCUP(Number(selectedOrder.deposit_amount))} {selectedOrder.deposit_paid ? "✓" : "(pendiente)"}</p>
                    <p>Saldo: {formatCUP(Number(selectedOrder.remaining_balance))} {selectedOrder.balance_paid ? "✓" : "(pendiente)"}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <h4 className="font-medium">Datos del Cliente</h4>
                <div className="text-sm space-y-1 p-4 bg-muted/50 rounded-lg">
                  <p><strong>Nombre:</strong> {selectedOrder.shipping_name}</p>
                  <p><strong>Teléfono:</strong> {selectedOrder.shipping_phone}</p>
                  <p><strong>Dirección:</strong> {selectedOrder.shipping_address}</p>
                  <p><strong>Ciudad:</strong> {selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code}</p>
                  <p><strong>País:</strong> {selectedOrder.shipping_country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-medium">Artículos del Pedido</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      {item.is_custom ? (
                        <div className="space-y-2">
                          <p className="font-medium">
                            Mueble Personalizado - {FURNITURE_TYPE_LABELS[item.custom_furniture_type as FurnitureType]}
                          </p>
                          <div className="text-sm text-muted-foreground grid gap-1 md:grid-cols-2">
                            <p>Dimensiones: {item.custom_length} x {item.custom_width} x {item.custom_height} cm</p>
                            <p>Madera: {item.custom_wood_type?.name}</p>
                            <p>Acabado: {item.custom_finish?.name}</p>
                            {item.custom_notes && <p className="md:col-span-2">Notas: {item.custom_notes}</p>}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      )}
                      <p className="text-right font-medium mt-2">
                        {formatCUP(Number(item.total_price))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="space-y-2">
                  <h4 className="font-medium">Notas del Pedido</h4>
                  <p className="text-sm p-4 bg-muted/50 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {selectedOrder.service_order?.[0] && (
                  <Button variant="outline">
                    Ver Orden de Servicio
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
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
