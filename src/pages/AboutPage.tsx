import { motion } from "framer-motion";
import { Armchair, Users, Award, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
          Sobre Djavu
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Artesanía cubana con tradición, ahora al alcance de todos.
        </p>
      </motion.div>

      {/* Story */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-2xl font-bold mb-4">Nuestra Historia</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Djavu nació de la pasión por la carpintería artesanal cubana.
              Ubicados en el corazón de Santa Clara, nuestro taller combina
              técnicas tradicionales con diseños contemporáneos para crear
              muebles que cuentan una historia.
            </p>
            <p>
              Hoy, combinamos técnicas tradicionales con tecnología moderna.
              Cada pieza que sale de nuestro taller lleva el espíritu de
              la artesanía cubana: muebles construidos para durar generaciones.
            </p>
            <p>
              Nuestro equipo de artesanos cualificados reúne décadas de experiencia
              combinada. Desde seleccionar las mejores maderas hasta
              aplicar el acabado perfecto, nos enorgullecemos de cada paso del
              proceso.
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-muted rounded-lg p-8 flex items-center justify-center min-h-[300px]"
        >
          <div className="text-center">
            <Armchair className="h-24 w-24 text-primary mx-auto mb-4" />
            <p className="font-serif text-xl font-bold">Djavu</p>
            <p className="text-muted-foreground">Santa Clara, Cuba</p>
          </div>
        </motion.div>
      </div>

      {/* Values */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <h2 className="font-serif text-2xl font-bold mb-8 text-center">
          Nuestros Valores
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-lg text-center">
            <Award className="h-10 w-10 text-accent mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Calidad Ante Todo</h3>
            <p className="text-sm text-muted-foreground">
              Nunca comprometemos los materiales o la artesanía. Cada pieza
              cumple con nuestros exigentes estándares.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg text-center">
            <Armchair className="h-10 w-10 text-accent mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Sostenibilidad</h3>
            <p className="text-sm text-muted-foreground">
              Toda nuestra madera proviene de bosques certificados de forma sostenible.
              Minimizamos los residuos en cada proyecto.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg text-center">
            <Users className="h-10 w-10 text-accent mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Enfoque al Cliente</h3>
            <p className="text-sm text-muted-foreground">
              Tu visión guía nuestro trabajo. Escuchamos, asesoramos y creamos
              muebles que superan las expectativas.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg text-center">
            <Heart className="h-10 w-10 text-accent mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Pasión</h3>
            <p className="text-sm text-muted-foreground">
              Amamos lo que hacemos. Esa pasión se refleja en cada unión, cada
              acabado, cada pieza que creamos.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Team */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="bg-secondary rounded-lg p-8"
      >
        <h2 className="font-serif text-2xl font-bold mb-6 text-center">
          Conoce a Nuestro Equipo
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">👨‍🔧</span>
            </div>
            <h3 className="font-semibold">Marco Ferreira</h3>
            <p className="text-sm text-muted-foreground">Maestro Artesano</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">👩‍💼</span>
            </div>
            <h3 className="font-semibold">Sofía Santos</h3>
            <p className="text-sm text-muted-foreground">Directora de Diseño</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">👨‍💻</span>
            </div>
            <h3 className="font-semibold">Pedro Costa</h3>
            <p className="text-sm text-muted-foreground">Director de Operaciones</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
