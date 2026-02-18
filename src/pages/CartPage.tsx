"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { FURNITURE_TYPE_LABELS } from "@/lib/types";
import { formatCUP } from "@/lib/currency";

export default function CartPage() {
  const { items, itemCount, subtotal, depositAmount, remainingBalance, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold mb-2">Tu Carrito Está Vacío</h1>
          <p className="text-muted-foreground mb-6">
            Parece que aún no has añadido ningún mueble.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/products">Ver Productos</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/customize">Diseñar Pieza Personalizada</Link>
            </Button>
          </div>
        </motion.div>
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
        <h1 className="font-serif text-3xl font-bold mb-8">Carrito de Compra</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        {item.type === "standard" && item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-4xl">
                            {item.type === "custom" ? "🛠️" : "🪑"}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {item.type === "standard"
                            ? item.product?.name
                            : `${FURNITURE_TYPE_LABELS[item.customConfig!.furnitureType]} Personalizado`}
                        </h3>
                        {item.type === "standard" ? (
                          <p className="text-sm text-muted-foreground">
                            {item.product?.wood_type?.name} • {item.product?.finish?.name}
                          </p>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            <p>
                              {item.customConfig?.woodType.name} •{" "}
                              {item.customConfig?.finish.name}
                            </p>
                            <p>
                              {item.customConfig?.length}cm × {item.customConfig?.width}cm ×{" "}
                              {item.customConfig?.height}cm
                            </p>
                          </div>
                        )}
                        <p className="font-semibold mt-2">
                          {formatCUP(item.unitPrice)}
                        </p>
                      </div>

                      {/* Quantity & Remove */}
                      <div className="flex flex-col items-end gap-2">
                        {item.type === "standard" ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Artículo personalizado
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Resumen del Pedido</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Artículos ({itemCount})
                    </span>
                    <span>{formatCUP(subtotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>{formatCUP(subtotal)}</span>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Anticipo Requerido (50%)</span>
                      <span className="font-semibold text-accent">
                        {formatCUP(depositAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Saldo a Pagar en Entrega</span>
                      <span>{formatCUP(remainingBalance)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {user ? (
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/checkout">
                        Proceder al Pago
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button className="w-full" size="lg" asChild>
                        <Link href="/auth">Iniciar Sesión para Pagar</Link>
                      </Button>
                      <p className="text-sm text-muted-foreground text-center">
                        Necesitas iniciar sesión para completar tu pedido.
                      </p>
                    </>
                  )}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/products">Continuar Comprando</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
