import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Package, Ruler, TreePine, PaintBucket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Product, FURNITURE_CATEGORY_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { formatCUP } from "@/lib/currency";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addStandardItem } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          wood_type:wood_types(*),
          finish:finishes(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, wood_type:wood_types(*), finish:finishes(*)")
        .eq("is_active", true)
        .eq("category", product!.category)
        .neq("id", id!)
        .limit(4);

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!product?.category,
  });

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-serif text-3xl font-bold mb-2">Producto No Encontrado</h1>
        <Button asChild className="mt-4">
          <Link to="/products">Volver al Catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
          <Link to="/products" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Catálogo
          </Link>
          <span>/</span>
          <span>{FURNITURE_CATEGORY_LABELS[product.category]}</span>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-8xl">🪑</span>
              )}
            </div>
            {product.is_featured && (
              <Badge className="absolute top-4 left-4 bg-accent">Destacado</Badge>
            )}
            {product.stock_quantity === 0 && (
              <Badge variant="destructive" className="absolute top-4 right-4">
                Agotado
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {FURNITURE_CATEGORY_LABELS[product.category]}
              </Badge>
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-primary">
                {formatCUP(product.base_price)}
              </p>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            <Separator />

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4">
              {product.wood_type && (
                <div className="flex items-start gap-3">
                  <TreePine className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Madera</p>
                    <p className="font-medium">{product.wood_type.name}</p>
                  </div>
                </div>
              )}
              {product.finish && (
                <div className="flex items-start gap-3">
                  <PaintBucket className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Acabado</p>
                    <p className="font-medium">{product.finish.name}</p>
                  </div>
                </div>
              )}
              {(product.dimensions_length || product.dimensions_width || product.dimensions_height) && (
                <div className="flex items-start gap-3 col-span-2">
                  <Ruler className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dimensiones (L×A×H)</p>
                    <p className="font-medium">
                      {product.dimensions_length} × {product.dimensions_width} × {product.dimensions_height} cm
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Stock & Add to Cart */}
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {product.stock_quantity > 0
                  ? `${product.stock_quantity} unidades disponibles`
                  : "Sin stock disponible"}
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={() => addStandardItem(product)}
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Añadir al Carrito
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Anticipo del 50% al realizar el pedido. Saldo al entregar.
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-bold mb-6">
              Productos Relacionados
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <Card key={rp.id} className="overflow-hidden card-hover group">
                  <Link to={`/products/${rp.id}`}>
                    <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
                      {rp.images && rp.images.length > 0 ? (
                        <img
                          src={rp.images[0]}
                          alt={rp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-4xl">🪑</span>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link to={`/products/${rp.id}`}>
                      <h3 className="font-semibold hover:text-primary transition-colors">
                        {rp.name}
                      </h3>
                    </Link>
                    <p className="font-bold mt-1">
                      {formatCUP(rp.base_price)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
