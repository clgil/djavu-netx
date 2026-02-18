import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Save, TreeDeciduous, Paintbrush, Plus } from "lucide-react";
import { FURNITURE_TYPE_LABELS, FurnitureType } from "@/lib/types";
import { formatCUP } from "@/lib/currency";

export default function AdminCostSheetPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cost sheet
  const { data: costSheet, isLoading: loadingCostSheet } = useQuery({
    queryKey: ["admin-cost-sheet"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cost_sheets")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch wood types
  const { data: woodTypes, isLoading: loadingWoods } = useQuery({
    queryKey: ["admin-wood-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wood_types")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Fetch finishes
  const { data: finishes, isLoading: loadingFinishes } = useQuery({
    queryKey: ["admin-finishes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("finishes")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Fetch extras
  const { data: extras, isLoading: loadingExtras } = useQuery({
    queryKey: ["admin-extras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extras")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Cost sheet form state
  const [costSheetForm, setCostSheetForm] = useState<any>(null);

  // Initialize form when data loads
  if (costSheet && !costSheetForm) {
    setCostSheetForm(costSheet);
  }

  // Update cost sheet mutation
  const updateCostSheetMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("cost_sheets")
        .update(data)
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cost-sheet"] });
      toast({
        title: "Guardado",
        description: "La hoja de costos se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la hoja de costos.",
        variant: "destructive",
      });
    },
  });

  // Update wood type mutation
  const updateWoodTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("wood_types")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-wood-types"] });
      toast({
        title: "Guardado",
        description: "El tipo de madera se ha actualizado.",
      });
    },
  });

  // Update finish mutation
  const updateFinishMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("finishes")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-finishes"] });
      toast({
        title: "Guardado",
        description: "El acabado se ha actualizado.",
      });
    },
  });

  const handleCostSheetChange = (field: string, value: number) => {
    setCostSheetForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveCostSheet = () => {
    if (costSheetForm) {
      updateCostSheetMutation.mutate(costSheetForm);
    }
  };

  const complexityFields: { key: string; type: FurnitureType }[] = [
    { key: "complexity_multiplier_dining_table", type: "dining_table" },
    { key: "complexity_multiplier_coffee_table", type: "coffee_table" },
    { key: "complexity_multiplier_bookshelf", type: "bookshelf" },
    { key: "complexity_multiplier_bed_frame", type: "bed_frame" },
    { key: "complexity_multiplier_desk", type: "desk" },
    { key: "complexity_multiplier_cabinet", type: "cabinet" },
  ];

  const isLoading = loadingCostSheet || loadingWoods || loadingFinishes || loadingExtras;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Hoja de Costos</h2>
        <p className="text-muted-foreground">Configura los valores base para el cálculo de precios</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Calculator className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="wood" className="gap-2">
            <TreeDeciduous className="h-4 w-4" />
            Maderas
          </TabsTrigger>
          <TabsTrigger value="finishes" className="gap-2">
            <Paintbrush className="h-4 w-4" />
            Acabados
          </TabsTrigger>
          <TabsTrigger value="extras" className="gap-2">
            <Plus className="h-4 w-4" />
            Extras
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parámetros Generales</CardTitle>
              <CardDescription>
                Valores base para el cálculo de precios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="labor_rate">Tarifa por Hora (CUP)</Label>
                  <Input
                    id="labor_rate"
                    type="number"
                    step="0.01"
                    value={costSheetForm?.labor_rate_per_hour || 0}
                    onChange={(e) => handleCostSheetChange("labor_rate_per_hour", parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profit_margin">Margen de Beneficio (%)</Label>
                  <Input
                    id="profit_margin"
                    type="number"
                    step="0.01"
                    value={costSheetForm?.profit_margin_percentage || 0}
                    onChange={(e) => handleCostSheetChange("profit_margin_percentage", parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overhead">Gastos Generales (%)</Label>
                  <Input
                    id="overhead"
                    type="number"
                    step="0.01"
                    value={costSheetForm?.overhead_percentage || 0}
                    onChange={(e) => handleCostSheetChange("overhead_percentage", parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Multiplicadores de Complejidad</CardTitle>
              <CardDescription>
                Factor de ajuste según el tipo de mueble
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {complexityFields.map(({ key, type }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{FURNITURE_TYPE_LABELS[type]}</Label>
                    <Input
                      id={key}
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={costSheetForm?.[key] || 1}
                      onChange={(e) => handleCostSheetChange(key, parseFloat(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={saveCostSheet} 
              disabled={updateCostSheetMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </TabsContent>

        {/* Wood Types */}
        <TabsContent value="wood">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Madera</CardTitle>
              <CardDescription>
                Precios y multiplicadores por tipo de madera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Costo por m³ (CUP)</TableHead>
                    <TableHead>Multiplicador</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {woodTypes?.map((wood) => (
                    <TableRow key={wood.id}>
                      <TableCell className="font-medium">{wood.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={wood.cost_per_cubic_meter}
                          className="w-28"
                          onBlur={(e) => {
                            const newValue = parseFloat(e.target.value);
                            if (newValue !== wood.cost_per_cubic_meter) {
                              updateWoodTypeMutation.mutate({
                                id: wood.id,
                                data: { cost_per_cubic_meter: newValue },
                              });
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          defaultValue={wood.price_multiplier}
                          className="w-20"
                          onBlur={(e) => {
                            const newValue = parseFloat(e.target.value);
                            if (newValue !== wood.price_multiplier) {
                              updateWoodTypeMutation.mutate({
                                id: wood.id,
                                data: { price_multiplier: newValue },
                              });
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <span className={wood.is_active ? "text-green-600" : "text-red-600"}>
                          {wood.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateWoodTypeMutation.mutate({
                              id: wood.id,
                              data: { is_active: !wood.is_active },
                            });
                          }}
                        >
                          {wood.is_active ? "Desactivar" : "Activar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finishes */}
        <TabsContent value="finishes">
          <Card>
            <CardHeader>
              <CardTitle>Acabados</CardTitle>
              <CardDescription>
                Precios de acabados por metro cuadrado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Costo por m² (CUP)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finishes?.map((finish) => (
                    <TableRow key={finish.id}>
                      <TableCell className="font-medium">{finish.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={finish.cost_per_square_meter}
                          className="w-28"
                          onBlur={(e) => {
                            const newValue = parseFloat(e.target.value);
                            if (newValue !== finish.cost_per_square_meter) {
                              updateFinishMutation.mutate({
                                id: finish.id,
                                data: { cost_per_square_meter: newValue },
                              });
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <span className={finish.is_active ? "text-green-600" : "text-red-600"}>
                          {finish.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateFinishMutation.mutate({
                              id: finish.id,
                              data: { is_active: !finish.is_active },
                            });
                          }}
                        >
                          {finish.is_active ? "Desactivar" : "Activar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Extras */}
        <TabsContent value="extras">
          <Card>
            <CardHeader>
              <CardTitle>Extras</CardTitle>
              <CardDescription>
                Componentes adicionales y sus precios base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Precio Base (CUP)</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extras?.map((extra) => (
                    <TableRow key={extra.id}>
                      <TableCell className="font-medium">{extra.name}</TableCell>
                      <TableCell className="text-muted-foreground">{extra.description}</TableCell>
                      <TableCell>{formatCUP(extra.base_price)}</TableCell>
                      <TableCell>
                        <span className={extra.is_active ? "text-green-600" : "text-red-600"}>
                          {extra.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
