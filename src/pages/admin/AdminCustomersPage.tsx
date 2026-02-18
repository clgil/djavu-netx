import { useState } from "react";
import { formatCUP } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Users } from "lucide-react";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get order counts and totals for each customer
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("user_id, subtotal, deposit_paid");

      if (ordersError) throw ordersError;

      // Aggregate order data by user
      const ordersByUser = orders?.reduce((acc: Record<string, { count: number; total: number }>, order) => {
        if (!order.user_id) return acc;
        if (!acc[order.user_id]) {
          acc[order.user_id] = { count: 0, total: 0 };
        }
        acc[order.user_id].count += 1;
        acc[order.user_id].total += Number(order.subtotal);
        return acc;
      }, {});

      // Combine profiles with order data
      return profiles?.map((profile) => ({
        ...profile,
        orderCount: ordersByUser?.[profile.user_id]?.count || 0,
        totalSpent: ordersByUser?.[profile.user_id]?.total || 0,
      }));
    },
  });

  const filteredCustomers = customers?.filter((customer) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.city?.toLowerCase().includes(searchLower)
    );
  });

  const totalCustomers = customers?.length || 0;
  const customersWithOrders = customers?.filter((c) => c.orderCount > 0).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
        <p className="text-muted-foreground">Gestión de clientes registrados</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clientes
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Clientes registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Con Pedidos
            </CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersWithOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Han realizado al menos un pedido</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({filteredCustomers?.length || 0})</CardTitle>
          <CardDescription>Todos los clientes registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCustomers?.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No se encontraron clientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Pedidos</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers?.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.full_name || "Sin nombre"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{customer.phone || "Sin teléfono"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{customer.city || "Sin ciudad"}</p>
                          <p className="text-muted-foreground">{customer.country}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.orderCount > 0 ? "default" : "secondary"}>
                          {customer.orderCount} {customer.orderCount === 1 ? "pedido" : "pedidos"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.totalSpent > 0 ? (
                          <span className="font-medium">
                            {formatCUP(customer.totalSpent)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(customer.created_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
