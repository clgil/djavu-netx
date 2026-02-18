"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Clock, CheckCircle, TrendingUp, Users } from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCUP } from "@/lib/currency";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      // Get orders with their items
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders?.filter(o => new Date(o.created_at) >= today) || [];
      const pendingQuotes = orders?.filter(o => o.status === "quote_generated") || [];
      const inProduction = orders?.filter(o => o.status === "in_production") || [];
      const depositsPaid = orders?.filter(o => o.deposit_paid) || [];
      
      const totalDeposits = depositsPaid.reduce((sum, o) => sum + Number(o.deposit_amount), 0);
      const outstandingBalance = orders
        ?.filter(o => o.deposit_paid && !o.balance_paid)
        .reduce((sum, o) => sum + Number(o.remaining_balance), 0) || 0;

      return {
        totalOrders: orders?.length || 0,
        todayOrders: todayOrders.length,
        pendingQuotes: pendingQuotes.length,
        inProduction: inProduction.length,
        totalDeposits,
        outstandingBalance,
        recentOrders: orders?.slice(0, 5) || [],
      };
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["admin-customers-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Pedidos Hoy",
      value: stats?.todayOrders || 0,
      icon: Package,
      description: "Nuevos pedidos recibidos hoy",
      color: "text-blue-600",
    },
    {
      title: "Presupuestos Pendientes",
      value: stats?.pendingQuotes || 0,
      icon: Clock,
      description: "Esperando aprobación del cliente",
      color: "text-yellow-600",
    },
    {
      title: "En Producción",
      value: stats?.inProduction || 0,
      icon: TrendingUp,
      description: "Pedidos en fabricación",
      color: "text-purple-600",
    },
    {
      title: "Anticipos Recibidos",
      value: formatCUP(stats?.totalDeposits || 0),
      icon: DollarSign,
      description: "Total de anticipos cobrados",
      color: "text-green-600",
    },
    {
      title: "Saldo Pendiente",
      value: formatCUP(stats?.outstandingBalance || 0),
      icon: DollarSign,
      description: "Por cobrar en entregas",
      color: "text-orange-600",
    },
    {
      title: "Clientes Registrados",
      value: customers || 0,
      icon: Users,
      description: "Total de clientes",
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Panel Principal</h2>
        <p className="text-muted-foreground">Resumen de la actividad de Djavu</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Últimos pedidos recibidos</CardDescription>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">Ver Todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats?.recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay pedidos aún
            </p>
          ) : (
            <div className="space-y-4">
              {stats?.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCUP(Number(order.subtotal))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.deposit_paid ? "Anticipo pagado" : "Pendiente de pago"}
                      </p>
                    </div>
                    <Badge className={ORDER_STATUS_COLORS[order.status as OrderStatus]}>
                      {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
