"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FurnitureCategory } from "@/lib/types";

const categories: FurnitureCategory[] = ["tables", "chairs", "beds", "cabinets", "shelving", "desks"];

const initialForm = {
  id: "",
  name: "",
  description: "",
  category: "tables" as FurnitureCategory,
  base_price: 0,
  stock_quantity: 0,
  is_active: true,
  image_urls: "",
};

export default function AdminProductsPage() {
  const [form, setForm] = useState(initialForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        base_price: Number(form.base_price),
        stock_quantity: Number(form.stock_quantity),
        is_active: form.is_active,
        images: form.image_urls.split("\n").map((i) => i.trim()).filter(Boolean),
      };

      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setForm(initialForm);
      toast({ title: "Producto guardado", description: "Cambios aplicados correctamente." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestión de Productos</h2>
        <p className="text-muted-foreground">CRUD completo, activación y galería de imágenes.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{form.id ? "Editar producto" : "Crear producto"}</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Nombre" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Select value={form.category} onValueChange={(value) => setForm((p) => ({ ...p, category: value as FurnitureCategory }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" placeholder="Precio base" value={form.base_price} onChange={(e) => setForm((p) => ({ ...p, base_price: Number(e.target.value) }))} />
          <Input type="number" placeholder="Stock" value={form.stock_quantity} onChange={(e) => setForm((p) => ({ ...p, stock_quantity: Number(e.target.value) }))} />
          <Textarea className="md:col-span-2" placeholder="Descripción" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <Textarea className="md:col-span-2" placeholder="URLs de imágenes (una por línea). La primera se usa como principal." value={form.image_urls} onChange={(e) => setForm((p) => ({ ...p, image_urls: e.target.value }))} />
          <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(checked) => setForm((p) => ({ ...p, is_active: !!checked }))} /> <span className="text-sm">Activo</span></div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button variant="outline" onClick={() => setForm(initialForm)}>Limpiar</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>Guardar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Listado de productos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {products?.map((product: any) => (
            <div key={product.id} className="border rounded-lg p-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.category} · {product.stock_quantity} uds · {product.base_price} CUP</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={product.is_active ? "default" : "secondary"}>{product.is_active ? "Activo" : "Inactivo"}</Badge>
                <Button size="sm" variant="outline" onClick={() => setForm({
                  id: product.id,
                  name: product.name,
                  description: product.description || "",
                  category: product.category,
                  base_price: Number(product.base_price),
                  stock_quantity: Number(product.stock_quantity),
                  is_active: !!product.is_active,
                  image_urls: (product.images || []).join("\n"),
                })}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(product.id)}>Eliminar</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
