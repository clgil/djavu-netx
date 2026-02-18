import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/lib/types";
import { buildMinimalPdf, blobToBase64 } from "@/lib/pdf";

interface WorkflowInput {
  order: { id: string; order_number: string; subtotal: number; deposit_amount: number; remaining_balance: number; shipping_name: string | null; shipping_phone: string | null; payment_method?: string | null };
  user: { id: string | null; email?: string | null };
  items: CartItem[];
  paidAmount: number;
}

export async function ensureServiceOrderAndInvoice(input: WorkflowInput) {
  const hasCustom = input.items.some((item) => item.type === "custom");
  const hasStandard = input.items.some((item) => item.type === "standard");
  const depositThreshold = hasCustom ? input.order.deposit_amount : input.order.subtotal;

  const shouldCreateServiceOrder = hasCustom || input.paidAmount >= depositThreshold;
  const shouldCreateInvoice = (hasStandard && input.paidAmount >= input.order.subtotal) || (hasCustom && input.paidAmount >= depositThreshold);

  if (shouldCreateServiceOrder) {
    const { data: existingSO } = await supabase.from("service_orders").select("id").eq("order_id", input.order.id).maybeSingle();

    if (!existingSO) {
      const qrData = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DJAVU-${input.order.order_number}`;
      const lines = [
        "DJAVU - ORDEN DE SERVICIO",
        `Orden: ${input.order.order_number}`,
        `Cliente: ${input.order.shipping_name ?? "N/A"}`,
        `Telefono: ${input.order.shipping_phone ?? "N/A"}`,
        `Total: ${input.order.subtotal.toFixed(2)} CUP`,
        `Deposito: ${input.order.deposit_amount.toFixed(2)} CUP`,
        `Saldo: ${input.order.remaining_balance.toFixed(2)} CUP`,
      ];
      const servicePdf = buildMinimalPdf(lines);
      const servicePdfBase64 = await blobToBase64(servicePdf);

      await supabase.from("service_orders").insert({
        service_order_number: `SO-${Date.now()}`,
        order_id: input.order.id,
        customer_name: input.order.shipping_name ?? "Cliente",
        customer_phone: input.order.shipping_phone,
        customer_email: input.user.email,
        technical_specifications: {
          items: input.items.map((item) => ({
            type: item.type,
            name: item.type === "standard" ? item.product?.name : item.customConfig?.furnitureType,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          service_order_pdf_base64: servicePdfBase64,
        },
        total_price: input.order.subtotal,
        deposit_paid: input.order.deposit_amount,
        remaining_balance: input.order.remaining_balance,
        estimated_production_days: 21,
        qr_code_data: qrData,
      });
    }
  }

  if (shouldCreateInvoice) {
    const { data: existingInvoice } = await supabase.from("invoices").select("id").eq("order_id", input.order.id).maybeSingle();

    if (!existingInvoice) {
      const lines = [
        "DJAVU - FACTURA",
        `Orden: ${input.order.order_number}`,
        `Cliente: ${input.order.shipping_name ?? "N/A"}`,
        `Metodo: ${input.order.payment_method ?? "cash"}`,
        `Monto pagado: ${input.paidAmount.toFixed(2)} CUP`,
        `Subtotal: ${input.order.subtotal.toFixed(2)} CUP`,
        `Saldo pendiente: ${input.order.remaining_balance.toFixed(2)} CUP`,
      ];
      const invoicePdf = buildMinimalPdf(lines);
      const invoicePdfBase64 = await blobToBase64(invoicePdf);

      await supabase.from("invoices").insert({
        invoice_number: `INV-${Date.now()}`,
        order_id: input.order.id,
        user_id: input.user.id,
        buyer_name: input.order.shipping_name ?? "Cliente",
        buyer_phone: input.order.shipping_phone,
        buyer_email: input.user.email,
        items_detail: {
          items: input.items.map((item) => ({
            type: item.type,
            name: item.type === "standard" ? item.product?.name : item.customConfig?.furnitureType,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.totalPrice,
          })),
          invoice_pdf_base64: invoicePdfBase64,
        },
        subtotal: input.order.subtotal,
        total: input.order.subtotal,
        deposit_paid: input.paidAmount,
        remaining_balance: input.order.remaining_balance,
      });
    }
  }
}
