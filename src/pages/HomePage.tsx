import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Hammer,
  Ruler,
  TreePine,
  Award,
  Truck,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Hammer,
    title: "Maestros Artesanos",
    description:
      "Cada pieza es elaborada a mano por artesanos cualificados con décadas de experiencia.",
  },
  {
    icon: Ruler,
    title: "Dimensiones Perfectas",
    description:
      "Medidas personalizadas para adaptarse exactamente a tu espacio. Sin compromisos.",
  },
  {
    icon: TreePine,
    title: "Maderas Premium",
    description:
      "Roble, nogal, arce, cerezo y pino de fuentes sostenibles.",
  },
  {
    icon: Award,
    title: "Calidad Garantizada",
    description:
      "Cada pieza incluye nuestra garantía de artesanía de por vida.",
  },
  {
    icon: Truck,
    title: "Entrega Premium",
    description:
      "Entrega profesional e instalación en tu hogar.",
  },
  {
    icon: Shield,
    title: "Pagos Seguros",
    description:
      "50% de anticipo para iniciar, saldo al entregar. Simple y seguro.",
  },
];

const testimonials = [
  {
    name: "María Hernández",
    location: "Santa Clara",
    text: "La mesa de comedor personalizada superó todas las expectativas. El acabado en caoba es absolutamente impresionante.",
    rating: 5,
  },
  {
    name: "Carlos Rodríguez",
    location: "Miami, FL",
    text: "Desde el exterior pude pagar fácilmente por PayPal. Le llegó perfecto a mi madre en Cuba. ¡Excelente servicio!",
    rating: 5,
  },
  {
    name: "Ana López",
    location: "La Habana",
    text: "Desde el diseño hasta la entrega, toda la experiencia fue profesional e impecable.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center hero-gradient wood-texture">
        <div className="container py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-primary-foreground"
          >
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Muebles Artesanales para Tu Hogar
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
              De nuestro taller en Santa Clara a tu hogar. Elige de nuestra colección
              o diseña tu pieza personalizada con nuestro
              configurador fácil de usar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-lg"
              >
                <Link to="/products">
                  Ver Colección
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link to="/customize">Diseña el Tuyo</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Estándar o Personalizado — Tú Eliges
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ya sea que elijas de nuestra colección cuidadosamente diseñada o
              crees algo único, cada pieza está construida para durar
              generaciones.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-lg shadow-wood card-hover"
            >
              <h3 className="font-serif text-2xl font-bold mb-4">
                Colección Estándar
              </h3>
              <ul className="space-y-3 mb-6 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">✓</span>
                  Diseños listos para pedir
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">✓</span>
                  Múltiples opciones de madera y acabado
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">✓</span>
                  Tiempos de entrega más rápidos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">✓</span>
                  Precios competitivos
                </li>
              </ul>
              <Button asChild>
                <Link to="/products">Ver Productos</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-lg shadow-wood card-hover border-2 border-accent"
            >
              <div className="inline-block bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded mb-3">
                TOTALMENTE PERSONALIZABLE
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">
                Muebles Personalizados
              </h3>
              <ul className="space-y-3 mb-6 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">✓</span>
                  Tus dimensiones exactas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">✓</span>
                  Elige madera, acabado y extras
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">✓</span>
                  Calculadora de precios en vivo
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">✓</span>
                  Piezas verdaderamente únicas
                </li>
              </ul>
              <Button variant="default" className="bg-accent hover:bg-accent/90" asChild>
                <Link to="/customize">Empezar a Diseñar</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Por Qué Elegir Djavu
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Desde materiales de origen sostenible hasta entrega premium,
              cuidamos cada detalle para que disfrutes de tus muebles
              durante años.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-lg shadow-sm card-hover"
              >
                <feature.icon className="h-10 w-10 text-accent mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Lo Que Dicen Nuestros Clientes
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-lg shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-gold">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para Crear Tu Pieza Perfecta?
            </h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8">
              Comienza con nuestra herramienta de personalización fácil y ve tu visión
              cobrar vida. Nuestro equipo está aquí para ayudarte en cada paso.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/customize">
                Empezar a Personalizar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
