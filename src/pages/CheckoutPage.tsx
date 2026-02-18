"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { CreditCard, Truck, ShoppingBag, Check, Loader2, ArrowLeft, ReceiptText, Landmark, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { FURNITURE_TYPE_LABELS } from "@/lib/types";
import { formatCUP } from "@/lib/currency";
import { ensureServiceOrderAndInvoice } from "@/lib/order-workflows";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const shippingSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  phone: z.string().min(9, "Se requiere un número de teléfono válido"),
  address: z.string().min(5, "La dirección es obligatoria"),
  city: z.string().min(2, "La ciudad es obligatoria"),
  postalCode: z.string().min(4, "El código postal es obligatorio"),
});

type PaymentMethod = "bank_transfer" | "cash" | "paypal_simulation" | "stripe_simulation" | "tropipay_simulation" | "qbapay_simulation";

type ShippingValues = z.infer<typeof shippingSchema>;

const steps = [
  { id: 1, title: "Revisar", icon: ShoppingBag },
  { id: 2, title: "Envío", icon: Truck },
  { id: 3, title: "Pago", icon: CreditCard },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingValues | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [payMode, setPayMode] = useState<"deposit" | "full">("deposit");
  const [paymentNote, setPaymentNote] = useState("");
  const [proofFileName, setProofFileName] = useState<string | null>(null);

  const hasCustom = useMemo(() => items.some((item) => item.type === "custom"), [items]);
  const requiredDeposit = hasCustom ? subtotal * 0.5 : subtotal;
  const canPayDeposit = hasCustom;

  const paidAmount = payMode === "full" ? subtotal : requiredDeposit;
  const remainingBalance = Math.max(0, subtotal - paidAmount);

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

  useEffect(() => {
    if (!user) router.replace("/auth");
  }, [user, router]);

  useEffect(() => {
    if (!canPayDeposit) {
      setPayMode("full");
    }
  }, [canPayDeposit]);

  if (!user) return null;

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  const handleShippingSubmit = (values: ShippingValues) => {
    setShippingData(values);
    setCurrentStep(3);
  };

  const handleCheckout = async () => {
    if (!shippingData) return;
    if ((paymentMethod === "bank_transfer" || paymentMethod === "cash") && !proofFileName) {
      toast.error("Para transferencia o efectivo debes adjuntar comprobante.");
      return;
    }

    setIsProcessing(true);

    try {
      const depositPaid = paidAmount >= requiredDeposit;
      const balancePaid = remainingBalance <= 0;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: `DJ-${Date.now()}`,
          user_id: user.id,
          subtotal,
          deposit_amount: requiredDeposit,
          remaining_balance: remainingBalance,
          payment_method: paymentMethod,
          deposit_paid: depositPaid,
          deposit_paid_at: depositPaid ? new Date().toISOString() : null,
          balance_paid: balancePaid,
          balance_paid_at: balancePaid ? new Date().toISOString() : null,
          status: depositPaid ? "deposit_paid" : "quote_generated",
          shipping_name: shippingData.name,
          shipping_phone: shippingData.phone,
          shipping_address: shippingData.address,
          shipping_city: shippingData.city,
          shipping_postal_code: shippingData.postalCode,
          shipping_country: "Cuba",
          notes: [paymentNote, proofFileName ? `Comprobante: ${proofFileName}` : ""].filter(Boolean).join("\n"),
          estimated_delivery_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
        .select()
        .single();

      if (orderError) throw orderError;

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
            custom_furniture_type: item.customConfig.furnitureType,
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

      await ensureServiceOrderAndInvoice({
        order,
        user: { id: user.id, email: user.email },
        items,
        paidAmount,
      });

      await supabase.from("notifications").insert({
        user_id: user.id,
        order_id: order.id,
        type: "order_payment_registered",
        title: "Pago registrado",
        message: `Pago de ${formatCUP(paidAmount)} registrado para ${order.order_number}.`,
      });

      clearCart();
      toast.success("Pedido procesado correctamente.");
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error("Error en el checkout:", error);
      toast.error("Error al procesar el pedido. Inténtalo nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/cart")}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="font-serif text-3xl font-bold">Finalizar Compra</h1>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep === step.id ? "bg-primary text-primary-foreground" : currentStep > step.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
                {index < steps.length - 1 && <div className="w-8 h-0.5 bg-border mx-2" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader><CardTitle>Revisa Tu Pedido</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-muted rounded-lg">
                        <div className="w-16 h-16 bg-background rounded flex items-center justify-center"><span className="text-2xl">{item.type === "custom" ? "🛠️" : "🪑"}</span></div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.type === "standard" ? item.product?.name : `${FURNITURE_TYPE_LABELS[item.customConfig!.furnitureType]} Personalizado`}</h4>
                          <p className="text-sm text-muted-foreground">Cant: {item.quantity}</p>
                        </div>
                        <div className="text-right"><p className="font-semibold">{formatCUP(item.totalPrice)}</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end"><Button onClick={() => setCurrentStep(2)}>Continuar al Envío</Button></div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader><CardTitle>Datos de Envío</CardTitle></CardHeader>
                <CardContent>
                  <Form {...shippingForm}>
                    <form onSubmit={shippingForm.handleSubmit(handleShippingSubmit)} className="space-y-4">
                      {(["name", "phone", "address", "city", "postalCode"] as const).map((fieldName) => (
                        <FormField
                          key={fieldName}
                          control={shippingForm.control}
                          name={fieldName}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{fieldName === "name" ? "Nombre Completo" : fieldName === "phone" ? "Número de Teléfono" : fieldName === "address" ? "Dirección" : fieldName === "city" ? "Ciudad" : "Código Postal"}</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                      <div className="flex justify-between pt-4"><Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>Atrás</Button><Button type="submit">Continuar al Pago</Button></div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader><CardTitle>Pago</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <FormLabel>Método de pago</FormLabel>
                      <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer"><span className="flex items-center gap-2"><Landmark className="h-4 w-4" />Transferencia bancaria</span></SelectItem>
                          <SelectItem value="cash"><span className="flex items-center gap-2"><Wallet className="h-4 w-4" />Pago en efectivo</span></SelectItem>
                          <SelectItem value="paypal_simulation">PayPal (simulado)</SelectItem>
                          <SelectItem value="stripe_simulation">Stripe (simulado)</SelectItem>
                          <SelectItem value="tropipay_simulation">Tropipay (simulado)</SelectItem>
                          <SelectItem value="qbapay_simulation">Qbapay (simulado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <FormLabel>Modalidad de cobro</FormLabel>
                      <Select value={payMode} onValueChange={(value) => setPayMode(value as "deposit" | "full")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {canPayDeposit && <SelectItem value="deposit">Pagar 50% de depósito</SelectItem>}
                          <SelectItem value="full">Pagar 100% del pedido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(paymentMethod === "bank_transfer" || paymentMethod === "cash") && (
                    <div className="space-y-2">
                      <FormLabel>Comprobante (obligatorio)</FormLabel>
                      <Input type="file" accept="image/*,.pdf" onChange={(e) => setProofFileName(e.target.files?.[0]?.name || null)} />
                      {proofFileName && <p className="text-xs text-muted-foreground">Archivo: {proofFileName}</p>}
                    </div>
                  )}

                  <div className="space-y-2">
                    <FormLabel>Notas del pago</FormLabel>
                    <Textarea value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="Ej: banco emisor, referencia, observaciones" />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} disabled={isProcessing}>Atrás</Button>
                    <Button type="button" disabled={isProcessing} onClick={handleCheckout}>
                      {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar pago {formatCUP(paidAmount)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5" />Resumen del Pedido</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({items.length} artículos)</span><span>{formatCUP(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span className="text-accent">Gratis</span></div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{formatCUP(subtotal)}</span></div>
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="flex justify-between font-semibold"><span>A pagar ahora</span><span className="text-accent">{formatCUP(paidAmount)}</span></div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-2"><span>Saldo pendiente</span><span>{formatCUP(remainingBalance)}</span></div>
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
