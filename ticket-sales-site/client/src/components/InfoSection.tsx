import { Clock, Users, Eye, MapPin } from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: '93 Metros de Altura',
    description: 'O ponto de observação mais alto de Boa Vista com vista panorâmica de 360°',
  },
  {
    icon: Users,
    title: 'Experiência em Grupo',
    description: 'Perfeito para famílias, escolas e grupos turísticos com agendamento especial',
  },
  {
    icon: Clock,
    title: 'Funcionamento',
    description: 'Aberto de quarta a domingo, das 15h às 21h. Ingressos gratuitos para crianças menores de 3 anos',
  },
  {
    icon: MapPin,
    title: 'Localização Privilegiada',
    description: 'Localizado no Parque do Rio Branco, maior obra turística de Roraima',
  },
];

export default function InfoSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="heading text-[#0F3460] mb-4">Por Que Visitar o Mirante?</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubra uma experiência única com vistas espetaculares e conforto garantido
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex gap-6 p-6 rounded-xl bg-gradient-to-br from-[#F5F5F5] to-white hover:shadow-lg transition-shadow duration-300">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-gradient-to-br from-[#0F3460] to-[#2E8BC0]">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0F3460] mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
