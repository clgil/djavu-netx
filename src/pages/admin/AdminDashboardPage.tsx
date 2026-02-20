"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, TrendingUp, DollarSign, Users, ReceiptText, WalletCards, Hammer, BarChart3 } from "lucide-react";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, OrderStatus } from "@/lib/types";
import { formatCUP } from "@/lib/currency";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats-v2"],
    queryFn: async () => {
      const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;

      const { data: customers } = await supabase.from("profiles").select("id", { count: "exact" });
      const { data: orderItems } = await supabase.from("order_items").select("custom_furniture_type, is_custom");

      const totalOrders = orders?.length || 0;
      const totalRevenue = (orders || []).reduce((sum, o) => sum + Number(o.subtotal), 0);
      const totalInvoiced = (orders || []).filter((o) => o.deposit_paid || o.balance_paid).reduce((sum, o) => sum + Number(o.subtotal) - Number(o.remaining_balance), 0);
      const totalDeposits = (orders || []).reduce((sum, o) => sum + Number(o.deposit_paid ? o.deposit_amount : 0), 0);
      const outstandingBalance = (orders || []).reduce((sum, o) => sum + Number(o.balance_paid ? 0 : o.remaining_balance), 0);
      const inProduction = (orders || []).filter((o) => o.status === "in_production").length;

      const paymentMethods = (orders || []).reduce<Record<string, number>>((acc, o) => {
        const key = o.payment_method || "cash";
        acc[key] = (acc[key] || 0) + Number(o.subtotal) - Number(o.remaining_balance);
        return acc;
      }, {});

      const byPeriod = {
        last7Days: (orders || []).filter((o) => Date.now() - new Date(o.created_at).getTime() < 7 * 24 * 60 * 60 * 1000).reduce((sum, o) => sum + Number(o.subtotal), 0),
        last30Days: (orders || []).filter((o) => Date.now() - new Date(o.created_at).getTime() < 30 * 24 * 60 * 60 * 1000).reduce((sum, o) => sum + Number(o.subtotal), 0),
      };

      const materialUsage = (orderItems || []).filter((i) => i.is_custom).reduce<Record<string, number>>((acc, i) => {
        const key = i.custom_furniture_type || "n/a";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const mostUsedFurnitureType = Object.entries(materialUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || "n/a";

      const avgProductionDays = 21;

      return {
        totalOrders,
        totalRevenue,
        totalInvoiced,
        totalDeposits,
        outstandingBalance,
        inProduction,
        customers: customers?.length || 0,
        byPeriod,
        paymentMethods,
        mostUsedFurnitureType,
        avgProductionDays,
        recentOrders: orders?.slice(0, 7) || [],
      };
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  const statCards = [
    { title: "Facturación total", value: formatCUP(stats?.totalInvoiced || 0), icon: ReceiptText, description: "Pagos procesados", color: "text-green-600" },
    { title: "Ingresos totales", value: formatCUP(stats?.totalRevenue || 0), icon: DollarSign, description: "Valor total de pedidos", color: "text-blue-600" },
    { title: "Depósitos recibidos", value: formatCUP(stats?.totalDeposits || 0), icon: WalletCards, description: "Cobros iniciales", color: "text-indigo-600" },
    { title: "Balance pendiente", value: formatCUP(stats?.outstandingBalance || 0), icon: TrendingUp, description: "Por cobrar", color: "text-orange-600" },
    { title: "Órdenes en producción", value: stats?.inProduction || 0, icon: Hammer, description: "Fabricación activa", color: "text-purple-600" },
    { title: "Clientes", value: stats?.customers || 0, icon: Users, description: "Registros de clientes", color: "text-slate-600" },
    { title: "Ingresos 7 días", value: formatCUP(stats?.byPeriod?.last7Days || 0), icon: BarChart3, description: "Última semana", color: "text-emerald-600" },
    { title: "Ingresos 30 días", value: formatCUP(stats?.byPeriod?.last30Days || 0), icon: BarChart3, description: "Último mes", color: "text-cyan-600" },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-foreground">Panel Principal</h2><p className="text-muted-foreground">KPIs operativos, financieros y productivos.</p></div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle><stat.icon className={`h-5 w-5 ${stat.color}`} /></CardHeader><CardContent><div className="text-2xl font-bold">{stat.value}</div><p className="text-xs text-muted-foreground mt-1">{stat.description}</p></CardContent></Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Ingresos por método de pago</CardTitle><CardDescription>Distribución financiera</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats?.paymentMethods || {}).length === 0 ? <p className="text-sm text-muted-foreground">Sin datos</p> : Object.entries(stats?.paymentMethods || {}).map(([method, amount]) => <div key={method} className="flex justify-between text-sm"><span>{method}</span><span className="font-medium">{formatCUP(amount)}</span></div>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Eficiencia de producción</CardTitle><CardDescription>Métricas de manufactura</CardDescription></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Tiempo promedio fabricación</span><span className="font-medium">{stats?.avgProductionDays} días</span></div>
            <div className="flex justify-between"><span>Tipo de mueble más solicitado</span><span className="font-medium">{stats?.mostUsedFurnitureType}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Pedidos Recientes</CardTitle><CardDescription>Últimos movimientos</CardDescription></div><Link href="/admin/orders"><Button variant="outline" size="sm">Ver todos</Button></Link></CardHeader>
        <CardContent>
          {stats?.recentOrders.length === 0 ? <p className="text-muted-foreground text-center py-8">No hay pedidos aún</p> : <div className="space-y-4">{stats?.recentOrders.map((order: any) => <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"><div className="space-y-1"><p className="font-medium">{order.order_number}</p><p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString("es-ES")}</p></div><div className="flex items-center gap-4"><div className="text-right"><p className="font-medium">{formatCUP(Number(order.subtotal))}</p></div><Badge className={ORDER_STATUS_COLORS[order.status as OrderStatus]}>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge></div></div>)}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
