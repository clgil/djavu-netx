import { motion } from "framer-motion";
import { Ruler, PaintBucket, TreePine, Sparkles, ShoppingCart, Truck } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: TreePine,
    title: "Elige el Tipo de Mueble",
    description:
      "Selecciona entre mesas de comedor, mesas de centro, estanterías, estructuras de cama, escritorios o armarios. Cada tipo tiene su propio factor de complejidad que afecta el precio final.",
  },
  {
    number: 2,
    icon: Ruler,
    title: "Establece las Dimensiones",
    description:
      "Introduce el largo, ancho y alto exactos que necesitas. Nuestros artesanos construirán tu pieza según esas especificaciones precisas. Se aplican límites mínimos y máximos para cada tipo de mueble.",
  },
  {
    number: 3,
    icon: TreePine,
    title: "Selecciona la Madera",
    description:
      "Elige entre cinco tipos de madera premium: Pino (económico), Roble (resistente), Arce (contemporáneo), Cerezo (elegante) o Nogal (lujoso). Cada una tiene características y precios diferentes.",
  },
  {
    number: 4,
    icon: PaintBucket,
    title: "Elige el Acabado",
    description:
      "Selecciona entre Natural, Tinte Claro, Tinte Oscuro, Pintado Blanco o Lacado. Cada acabado afecta tanto la apariencia como la durabilidad de tu pieza.",
  },
  {
    number: 5,
    icon: Sparkles,
    title: "Añade Extras Opcionales",
    description:
      "Mejora tu mueble con tallados personalizados, herrajes premium, elementos de tela, insertos de cristal, almacenamiento oculto o gestión de cables. Cada extra suma al precio final.",
  },
  {
    number: 6,
    icon: ShoppingCart,
    title: "Revisa y Pide",
    description:
      "Ve el desglose completo del precio con materiales, mano de obra y acabados. Añade al carrito y procede al pago. Se requiere un anticipo del 50% para confirmar tu pedido.",
  },
  {
    number: 7,
    icon: Truck,
    title: "Producción y Entrega",
    description:
      "Una vez recibido tu anticipo, comienza la producción. Sigue tu pedido en cada etapa: En Producción → Fabricado → Listo para Entrega. Paga el 50% restante al recibir.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
          Cómo Funciona
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Crear tu mueble personalizado es sencillo. Sigue estos pasos para hacer
          realidad tu visión.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex gap-6 mb-12 last:mb-0"
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div className="w-0.5 flex-1 bg-border mt-4" />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-3 mb-2">
                <step.icon className="h-6 w-6 text-accent" />
                <h3 className="font-semibold text-xl">{step.title}</h3>
              </div>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-16 bg-muted rounded-lg p-8"
      >
        <h2 className="font-serif text-2xl font-bold mb-6 text-center">
          Preguntas Frecuentes
        </h2>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-semibold mb-2">¿Cuánto tarda la producción?</h3>
            <p className="text-muted-foreground">
              Los productos estándar se envían en 2-3 semanas. Las piezas personalizadas
              suelen tardar 4-6 semanas dependiendo de la complejidad y los pedidos actuales.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">¿Por qué se requiere un anticipo del 50%?</h3>
            <p className="text-muted-foreground">
              El anticipo cubre los materiales e inicia la producción. Asegura que
              podamos comenzar a fabricar tu pieza inmediatamente protegiendo a ambas partes.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">¿Puedo hacer cambios después de pedir?</h3>
            <p className="text-muted-foreground">
              Es posible realizar ajustes menores antes de que comience la producción.
              Contáctanos inmediatamente si necesitas hacer cambios.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">¿Cuál es su política de garantía?</h3>
            <p className="text-muted-foreground">
              Todas las piezas incluyen garantía de artesanía de por vida. Respaldamos
              nuestro trabajo y repararemos o reemplazaremos cualquier defecto.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
