import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  CreditCard,
  Truck,
  ShoppingBag,
  Check,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { FURNITURE_TYPE_LABELS } from "@/lib/types";
import { formatCUP } from "@/lib/currency";

const shippingSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  phone: z.string().min(9, "Se requiere un número de teléfono válido"),
  address: z.string().min(5, "La dirección es obligatoria"),
  city: z.string().min(2, "La ciudad es obligatoria"),
  postalCode: z.string().min(4, "El código postal es obligatorio"),
});

const paymentSchema = z.object({
  cardNumber: z.string().length(16, "El número de tarjeta debe tener 16 dígitos"),
  expiryMonth: z.string().length(2, "MM"),
  expiryYear: z.string().length(2, "AA"),
  cvv: z.string().min(3, "El CVV es obligatorio").max(4),
  cardName: z.string().min(2, "El nombre del titular es obligatorio"),
});

type ShippingValues = z.infer<typeof shippingSchema>;
type PaymentValues = z.infer<typeof paymentSchema>;

const steps = [
  { id: 1, title: "Revisar", icon: ShoppingBag },
  { id: 2, title: "Envío", icon: Truck },
  { id: 3, title: "Pago", icon: CreditCard },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { items, subtotal, depositAmount, remainingBalance, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingValues | null>(null);

  const shippingForm = useForm<ShippingValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: profile?.full_name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      city: profile?.city || "",
      postalCode: profile?.postal_code || "",
    },
  });

  const paymentForm = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardName: "",
    },
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleShippingSubmit = (values: ShippingValues) => {
    setShippingData(values);
    setCurrentStep(3);
  };

  const handlePaymentSubmit = async (values: PaymentValues) => {
    if (!shippingData) return;
    
    setIsProcessing(true);

    try {
      // Crear pedido - order_number se genera automáticamente por trigger
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: `DJ-${Date.now()}`,
          user_id: user.id,
          subtotal,
          deposit_amount: depositAmount,
          remaining_balance: remainingBalance,
          deposit_paid: true,
          deposit_paid_at: new Date().toISOString(),
          status: "deposit_paid" as const,
          shipping_name: shippingData.name,
          shipping_phone: shippingData.phone,
          shipping_address: shippingData.address,
          shipping_city: shippingData.city,
          shipping_postal_code: shippingData.postalCode,
          shipping_country: "Cuba",
          estimated_delivery_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Crear artículos del pedido
      for (const item of items) {
        if (item.type === "standard" && item.product) {
          await supabase.from("order_items").insert({
            order_id: order.id,
            product_id: item.product.id,
            is_custom: false,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.totalPrice,
          });
        } else if (item.type === "custom" && item.customConfig) {
          await supabase.from("order_items").insert({
            order_id: order.id,
            is_custom: true,
            quantity: 1,
            unit_price: item.unitPrice,
            total_price: item.totalPrice,
            custom_furniture_type: item.customConfig.furnitureType as "dining_table" | "coffee_table" | "bookshelf" | "bed_frame" | "desk" | "cabinet",
            custom_wood_type_id: item.customConfig.woodType.id,
            custom_finish_id: item.customConfig.finish.id,
            custom_length: item.customConfig.length,
            custom_width: item.customConfig.width,
            custom_height: item.customConfig.height,
            custom_extras: item.customConfig.extras.map((e) => e.id),
            custom_notes: item.customConfig.notes || null,
          });
        }
      }

      // Crear orden de servicio
      const specs = items.map((item) => ({
        type: item.type,
        name: item.type === "standard" ? item.product?.name : FURNITURE_TYPE_LABELS[item.customConfig!.furnitureType],
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      await supabase.from("service_orders").insert({
        service_order_number: `SO-${Date.now()}`,
        order_id: order.id,
        customer_name: shippingData.name,
        customer_phone: shippingData.phone,
        customer_email: user.email,
        technical_specifications: { items: specs },
        total_price: subtotal,
        deposit_paid: depositAmount,
        remaining_balance: remainingBalance,
        estimated_production_days: 21,
        qr_code_data: order.order_number,
      });

      // Crear notificación
      await supabase.from("notifications").insert({
        user_id: user.id,
        order_id: order.id,
        type: "order_confirmed",
        title: "Pedido Confirmado",
        message: `Tu pedido ${order.order_number} ha sido confirmado. Anticipo de ${formatCUP(depositAmount)} recibido. La producción comenzará en breve.`,
      });

      clearCart();
      toast.success("¡Pedido realizado con éxito!");
      navigate(`/orders/${order.id}`);
    } catch (error) {
      console.error("Error en el pago:", error);
      toast.error("Error al procesar el pedido. Por favor, inténtalo de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cart")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-serif text-3xl font-bold">Finalizar Compra</h1>
        </div>

        {/* Progress */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.id
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-border mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Review */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revisa Tu Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 bg-muted rounded-lg"
                      >
                        <div className="w-16 h-16 bg-background rounded flex items-center justify-center">
                          <span className="text-2xl">
                            {item.type === "custom" ? "🛠️" : "🪑"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {item.type === "standard"
                              ? item.product?.name
                              : `${FURNITURE_TYPE_LABELS[item.customConfig!.furnitureType]} Personalizado`}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Cant: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCUP(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setCurrentStep(2)}>
                      Continuar al Envío
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Shipping */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Datos de Envío</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...shippingForm}>
                    <form
                      onSubmit={shippingForm.handleSubmit(handleShippingSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={shippingForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={shippingForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Teléfono</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={shippingForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={shippingForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ciudad</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código Postal</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                        >
                          Atrás
                        </Button>
                        <Button type="submit">Continuar al Pago</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pago (Simulado)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-accent/10 p-4 rounded-lg mb-6">
                    <p className="text-sm text-muted-foreground">
                      Este es un pago simulado. No se realizarán cargos reales.
                      Introduce cualquier dato de tarjeta válido para continuar.
                    </p>
                  </div>
                  <Form {...paymentForm}>
                    <form
                      onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={paymentForm.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Tarjeta</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="1234 5678 9012 3456"
                                maxLength={16}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={paymentForm.control}
                          name="expiryMonth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mes</FormLabel>
                              <FormControl>
                                <Input placeholder="MM" maxLength={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentForm.control}
                          name="expiryYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Año</FormLabel>
                              <FormControl>
                                <Input placeholder="AA" maxLength={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentForm.control}
                          name="cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVV</FormLabel>
                              <FormControl>
                                <Input placeholder="123" maxLength={4} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={paymentForm.control}
                        name="cardName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Titular</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre en la tarjeta" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                          disabled={isProcessing}
                        >
                          Atrás
                        </Button>
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Pagar {formatCUP(depositAmount)} de Anticipo
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({items.length} artículos)
                    </span>
                    <span>{formatCUP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="text-accent">Gratis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCUP(subtotal)}</span>
                  </div>
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="flex justify-between font-semibold">
                      <span>A Pagar Hoy (50%)</span>
                      <span className="text-accent">
                        {formatCUP(depositAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>Saldo en Entrega</span>
                      <span>{formatCUP(remainingBalance)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
