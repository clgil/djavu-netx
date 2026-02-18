"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Filter, Grid, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Product, FurnitureCategory, FURNITURE_CATEGORY_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { formatCUP } from "@/lib/currency";

const categories: FurnitureCategory[] = [
  "tables",
  "chairs",
  "beds",
  "cabinets",
  "shelving",
  "desks",
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const { addStandardItem } = useCart();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          wood_type:wood_types(*),
          finish:finishes(*)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      search === "" ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "all" || product.category === category;

    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "0-500" && product.base_price <= 500) ||
      (priceRange === "500-1000" &&
        product.base_price > 500 &&
        product.base_price <= 1000) ||
      (priceRange === "1000-2000" &&
        product.base_price > 1000 &&
        product.base_price <= 2000) ||
      (priceRange === "2000+" && product.base_price > 2000);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
          Nuestra Colección
        </h1>
        <p className="text-muted-foreground">
          Descubre nuestras piezas de mobiliario artesanal, cada una hecha con cuidado y
          precisión.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {FURNITURE_CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Rango de Precio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Precios</SelectItem>
            <SelectItem value="0-500">Menos de $500 CUP</SelectItem>
            <SelectItem value="500-1000">$500 - $1.000 CUP</SelectItem>
            <SelectItem value="1000-2000">$1.000 - $2.000 CUP</SelectItem>
            <SelectItem value="2000+">Más de $2.000 CUP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden card-hover group">
                <Link href={`/products/${product.id}`}>
                  <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-6xl">🪑</div>
                    )}
                    {product.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-accent">
                        Destacado
                      </Badge>
                    )}
                    {product.stock_quantity === 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute top-2 right-2"
                      >
                        Agotado
                      </Badge>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.wood_type?.name} • {product.finish?.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {formatCUP(product.base_price)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => addStandardItem(product)}
                      disabled={product.stock_quantity === 0}
                    >
                      Añadir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No se encontraron productos con estos criterios.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setPriceRange("all");
            }}
          >
            Limpiar Filtros
          </Button>
        </div>
      )}

      {/* Custom CTA */}
      <div className="mt-16 bg-primary rounded-lg p-8 text-center text-primary-foreground">
        <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
          ¿No Encuentras Lo Que Buscas?
        </h2>
        <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
          Diseña tu propia pieza personalizada con nuestro configurador fácil de usar.
          Elige tus dimensiones, tipo de madera, acabado y más.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/customize">Diseñar Mueble Personalizado</Link>
        </Button>
      </div>
    </div>
  );
}
