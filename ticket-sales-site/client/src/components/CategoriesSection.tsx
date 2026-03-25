import { Ticket, Users, MapPin, Calendar, Zap, Heart } from 'lucide-react';

const categories = [
  { id: 1, name: 'Visitas Guiadas', icon: MapPin, color: 'from-[#0F3460] to-[#2E8BC0]' },
  { id: 2, name: 'Eventos Especiais', icon: Zap, color: 'from-[#2E8BC0] to-[#2D6A4F]' },
  { id: 3, name: 'Grupos', icon: Users, color: 'from-[#2D6A4F] to-[#D4AF37]' },
  { id: 4, name: 'Experiências Premium', icon: Heart, color: 'from-[#D4AF37] to-[#0F3460]' },
  { id: 5, name: 'Ingressos Avulsos', icon: Ticket, color: 'from-[#0F3460] to-[#2D6A4F]' },
  { id: 6, name: 'Agendamentos', icon: Calendar, color: 'from-[#2D6A4F] to-[#2E8BC0]' },
];

export default function CategoriesSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="heading text-[#0F3460] mb-4">Explore Nossas Categorias</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Escolha a experiência que mais se adequa ao seu estilo e aproveite o melhor do Mirante Edileusa Lóz
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="group cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-8 h-48 flex flex-col items-center justify-center text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                  <Icon className="w-12 h-12 mb-4 group-hover:scale-125 transition-transform duration-300" />
                  <h3 className="text-center font-semibold text-lg">{category.name}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
