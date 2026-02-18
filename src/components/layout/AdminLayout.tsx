"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Package, FileText, Users, Calculator, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Panel Principal" },
  { to: "/admin/orders", icon: Package, label: "Pedidos" },
  { to: "/admin/service-orders", icon: FileText, label: "Órdenes de Servicio" },
  { to: "/admin/cost-sheet", icon: Calculator, label: "Hoja de Costos" },
  { to: "/admin/customers", icon: Users, label: "Clientes" },
  { to: "/admin/products", icon: Package, label: "Productos" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { isManager, isLoading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isManager) {
      router.replace("/");
    }
  }, [isLoading, isManager, router]);

  if (isLoading || !isManager) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">DJ</span>
              </div>
              <span className="font-semibold text-foreground">Djavu Admin</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Package className="h-4 w-4" />
                Ver Tienda
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Panel de Administración</h1>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
