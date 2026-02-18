"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  TreePine,
  Ruler,
  PaintBucket,
  Sparkles,
  Calculator,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import {
  WoodType,
  Finish,
  Extra,
  FurnitureType,
  FURNITURE_TYPE_LABELS,
  CustomFurnitureConfig,
} from "@/lib/types";
import { formatCUP, formatCUPShort } from "@/lib/currency";

const furnitureTypes: { type: FurnitureType; icon: string; minDimensions: { l: number; w: number; h: number }; maxDimensions: { l: number; w: number; h: number } }[] = [
  { type: "dining_table", icon: "🍽️", minDimensions: { l: 120, w: 80, h: 70 }, maxDimensions: { l: 300, w: 150, h: 85 } },
  { type: "coffee_table", icon: "☕", minDimensions: { l: 80, w: 50, h: 35 }, maxDimensions: { l: 180, w: 100, h: 55 } },
  { type: "bookshelf", icon: "📚", minDimensions: { l: 60, w: 25, h: 100 }, maxDimensions: { l: 200, w: 45, h: 250 } },
  { type: "bed_frame", icon: "🛏️", minDimensions: { l: 190, w: 90, h: 35 }, maxDimensions: { l: 220, w: 200, h: 60 } },
  { type: "desk", icon: "💼", minDimensions: { l: 100, w: 50, h: 70 }, maxDimensions: { l: 200, w: 100, h: 85 } },
  { type: "cabinet", icon: "🗄️", minDimensions: { l: 40, w: 35, h: 80 }, maxDimensions: { l: 150, w: 60, h: 220 } },
];

const steps = [
  { id: 1, title: "Tipo", icon: TreePine },
  { id: 2, title: "Dimensiones", icon: Ruler },
  { id: 3, title: "Madera", icon: TreePine },
  { id: 4, title: "Acabado", icon: PaintBucket },
  { id: 5, title: "Extras", icon: Sparkles },
];

export default function CustomizePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<FurnitureType | null>(null);
  const [dimensions, setDimensions] = useState({ length: 0, width: 0, height: 0 });
  const [selectedWood, setSelectedWood] = useState<WoodType | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<Finish | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [notes, setNotes] = useState("");
  const { addCustomItem } = useCart();

  const { data: woodTypes } = useQuery({
    queryKey: ["woodTypes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("wood_types").select("*").eq("is_active", true);
      if (error) throw error;
      return data as WoodType[];
    },
  });

  const { data: finishes } = useQuery({
    queryKey: ["finishes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("finishes").select("*").eq("is_active", true);
      if (error) throw error;
      return data as Finish[];
    },
  });

  const { data: extras } = useQuery({
    queryKey: ["extras"],
    queryFn: async () => {
      const { data, error } = await supabase.from("extras").select("*").eq("is_active", true);
      if (error) throw error;
      return data as Extra[];
    },
  });


  const { data: costSheet } = useQuery({
    queryKey: ["active-cost-sheet"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cost_sheets").select("*").eq("is_active", true).single();
      if (error) throw error;
      return data;
    },
  });
  // Establecer dimensiones por defecto cuando se selecciona el tipo
  useEffect(() => {
    if (selectedType) {
      const typeConfig = furnitureTypes.find((t) => t.type === selectedType);
      if (typeConfig) {
        setDimensions({
          length: typeConfig.minDimensions.l,
          width: typeConfig.minDimensions.w,
          height: typeConfig.minDimensions.h,
        });
      }
    }
  }, [selectedType]);

  const currentTypeConfig = selectedType ? furnitureTypes.find((t) => t.type === selectedType) : null;

  const price = useMemo(() => {
    if (!selectedType || !selectedWood || !selectedFinish) return 0;

    const volume = (dimensions.length * dimensions.width * dimensions.height) / 1000000;
    const surfaceArea = (2 * (dimensions.length * dimensions.width + dimensions.length * dimensions.height + dimensions.width * dimensions.height)) / 10000;

    const materialCost = volume * selectedWood.cost_per_cubic_meter;
    const finishCost = surfaceArea * selectedFinish.cost_per_square_meter;
    const laborHours = volume * 40;
    const laborRate = Number(costSheet?.labor_rate_per_hour ?? 25);
    const laborCost = laborHours * laborRate;

    const complexityMultipliers: Record<FurnitureType, number> = {
      dining_table: Number(costSheet?.complexity_multiplier_dining_table ?? 1.5),
      coffee_table: Number(costSheet?.complexity_multiplier_coffee_table ?? 1.0),
      bookshelf: Number(costSheet?.complexity_multiplier_bookshelf ?? 1.2),
      bed_frame: Number(costSheet?.complexity_multiplier_bed_frame ?? 1.4),
      desk: Number(costSheet?.complexity_multiplier_desk ?? 1.3),
      cabinet: Number(costSheet?.complexity_multiplier_cabinet ?? 1.6),
    };

    const extrasCost = selectedExtras.reduce((sum, e) => sum + e.base_price, 0);
    const baseCost = (materialCost + laborCost + finishCost + extrasCost) * complexityMultipliers[selectedType];
    const margin = Number(costSheet?.profit_margin_percentage ?? 30) / 100;
    const overhead = Number(costSheet?.overhead_percentage ?? 15) / 100;
    const totalPrice = baseCost * (1 + margin) * (1 + overhead);

    return Math.max(0, Math.round(totalPrice));
  }, [selectedType, selectedWood, selectedFinish, dimensions, selectedExtras, costSheet]);

  const deposit = Math.round(price * 0.5);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedType !== null;
      case 2:
        return dimensions.length > 0 && dimensions.width > 0 && dimensions.height > 0;
      case 3:
        return selectedWood !== null;
      case 4:
        return selectedFinish !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleAddToCart = () => {
    if (!selectedType || !selectedWood || !selectedFinish) return;

    const config: CustomFurnitureConfig = {
      furnitureType: selectedType,
      woodType: selectedWood,
      finish: selectedFinish,
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height,
      extras: selectedExtras,
      notes,
    };

    addCustomItem(config, price);
    toast.success("¡Mueble personalizado añadido al carrito!");

    // Reiniciar formulario
    setCurrentStep(1);
    setSelectedType(null);
    setDimensions({ length: 0, width: 0, height: 0 });
    setSelectedWood(null);
    setSelectedFinish(null);
    setSelectedExtras([]);
    setNotes("");
  };

  const toggleExtra = (extra: Extra) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
          Diseña Tu Mueble Personalizado
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Construye tu pieza perfecta paso a paso. Ve el precio actualizarse en tiempo real
          mientras personalizas.
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "bg-accent text-accent-foreground cursor-pointer"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Furniture Type */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="font-semibold text-xl mb-4">
                      Selecciona el Tipo de Mueble
                    </h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {furnitureTypes.map((ft) => (
                        <button
                          key={ft.type}
                          onClick={() => setSelectedType(ft.type)}
                          className={`p-6 rounded-lg border-2 text-center transition-all ${
                            selectedType === ft.type
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-4xl mb-2 block">{ft.icon}</span>
                          <span className="font-medium">
                            {FURNITURE_TYPE_LABELS[ft.type]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Dimensions */}
                {currentStep === 2 && currentTypeConfig && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="font-semibold text-xl mb-4">
                      Establece las Dimensiones (cm)
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                      <div>
                        <Label>Largo</Label>
                        <Input
                          type="number"
                          value={dimensions.length}
                          onChange={(e) =>
                            setDimensions({ ...dimensions, length: Number(e.target.value) })
                          }
                          min={currentTypeConfig.minDimensions.l}
                          max={currentTypeConfig.maxDimensions.l}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {currentTypeConfig.minDimensions.l} - {currentTypeConfig.maxDimensions.l} cm
                        </p>
                      </div>
                      <div>
                        <Label>Ancho</Label>
                        <Input
                          type="number"
                          value={dimensions.width}
                          onChange={(e) =>
                            setDimensions({ ...dimensions, width: Number(e.target.value) })
                          }
                          min={currentTypeConfig.minDimensions.w}
                          max={currentTypeConfig.maxDimensions.w}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {currentTypeConfig.minDimensions.w} - {currentTypeConfig.maxDimensions.w} cm
                        </p>
                      </div>
                      <div>
                        <Label>Alto</Label>
                        <Input
                          type="number"
                          value={dimensions.height}
                          onChange={(e) =>
                            setDimensions({ ...dimensions, height: Number(e.target.value) })
                          }
                          min={currentTypeConfig.minDimensions.h}
                          max={currentTypeConfig.maxDimensions.h}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {currentTypeConfig.minDimensions.h} - {currentTypeConfig.maxDimensions.h} cm
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Wood Type */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="font-semibold text-xl mb-4">Elige el Tipo de Madera</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {woodTypes?.map((wood) => (
                        <button
                          key={wood.id}
                          onClick={() => setSelectedWood(wood)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedWood?.id === wood.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold">{wood.name}</span>
                            <span className="text-sm text-accent font-medium">
                              ×{wood.price_multiplier}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {wood.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Finish */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="font-semibold text-xl mb-4">Selecciona el Acabado</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {finishes?.map((finish) => (
                        <button
                          key={finish.id}
                          onClick={() => setSelectedFinish(finish)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedFinish?.id === finish.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold">{finish.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatCUPShort(finish.cost_per_square_meter)}/m²
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {finish.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Extras */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="font-semibold text-xl mb-4">
                      Añadir Extras (Opcional)
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      {extras?.map((extra) => (
                        <label
                          key={extra.id}
                          className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedExtras.find((e) => e.id === extra.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Checkbox
                            checked={!!selectedExtras.find((e) => e.id === extra.id)}
                            onCheckedChange={() => toggleExtra(extra)}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium">{extra.name}</span>
                              <span className="text-accent font-medium">
                                +{formatCUPShort(extra.base_price)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {extra.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div>
                      <Label>Notas Adicionales</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Cualquier petición especial o detalle..."
                        rows={3}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Atrás
                </Button>
                {currentStep < 5 ? (
                  <Button
                    onClick={() => setCurrentStep((s) => s + 1)}
                    disabled={!canProceed()}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleAddToCart} disabled={price === 0}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Añadir al Carrito
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Calculator */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculadora de Precio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedType && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo</span>
                    <span>{FURNITURE_TYPE_LABELS[selectedType]}</span>
                  </div>
                )}
                {dimensions.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dimensiones</span>
                    <span>
                      {dimensions.length}×{dimensions.width}×{dimensions.height} cm
                    </span>
                  </div>
                )}
                {selectedWood && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Madera</span>
                    <span>{selectedWood.name}</span>
                  </div>
                )}
                {selectedFinish && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Acabado</span>
                    <span>{selectedFinish.name}</span>
                  </div>
                )}
                {selectedExtras.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Extras</span>
                    <ul className="mt-1 space-y-1">
                      {selectedExtras.map((e) => (
                        <li key={e.id} className="flex justify-between">
                          <span>{e.name}</span>
                          <span>+{formatCUPShort(e.base_price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Precio Total</span>
                    <span>{formatCUP(price)}</span>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg mt-3">
                    <div className="flex justify-between text-sm">
                      <span>Anticipo (50%)</span>
                      <span className="font-semibold text-accent">
                        {formatCUP(deposit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Saldo en Entrega</span>
                      <span>{formatCUP(Math.max(0, price - deposit))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
