import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import EventCard from './EventCard';

const events = [
  {
    id: 1,
    title: 'Visita Diurna - Mirante Edileusa Lóz',
    date: '02 de Fevereiro',
    time: '15:00',
    location: 'Boa Vista, RR',
    capacity: 100,
    available: 45,
    price: 0,
    image: 'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-2_1770038910000_na1fn_aGVyby1taXJhbnRlLXN1bnNldA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvY3Q1aWloMTNyUkVKelZMOEJVUXhaZi9zYW5kYm94L1lOM2N2VnJEZktKWFVlWTdwcGlHczQtaW1nLTJfMTc3MDAzODkxMDAwMF9uYTFmbl9hR1Z5YnkxdGFYSmhiblJsTFhOMWJuTmxkQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=FfdXi1NM8V2RSw2vOGUPRNYRinUox7uu2YIZ8dtGIlg43n0hqtxshqyGSKCAoTWwPu6QmWmtuk8hiZNkN6fytcz~j72m8U0~6tH8agUEOI5IZt8qGa-DUR6PMOGOddOOlGoCPRdoy1u2xur2~sXNdP0-kVoVvZccAvl2xygDDHi8BVwJgqKdLLeWrShDOvGUJkGuBXP0yrChM5t3-x35WrYJl-ESvEqvKozPzwsspu8zep2v4YpMqP0ZJ-8vxyGPSBgdrg33MxflZU3GDk1g4KwB2objZx51Jmhva7tmuxEUef75nedG-4WkJPZB0OvvySK9tF9yhkosqX~B6mdXlQ__',
    badge: 'Gratuito',
  },
  {
    id: 2,
    title: 'Experiência Premium - Pôr do Sol',
    date: '03 de Fevereiro',
    time: '17:30',
    location: 'Boa Vista, RR',
    capacity: 50,
    available: 12,
    price: 89.9,
    image: 'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-2_1770038910000_na1fn_aGVyby1taXJhbnRlLXN1bnNldA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvY3Q1aWloMTNyUkVKelZMOEJVUXhaZi9zYW5kYm94L1lOM2N2VnJEZktKWFVlWTdwcGlHczQtaW1nLTJfMTc3MDAzODkxMDAwMF9uYTFmbl9hR1Z5YnkxdGFYSmhiblJsTFhOMWJuTmxkQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=FfdXi1NM8V2RSw2vOGUPRNYRinUox7uu2YIZ8dtGIlg43n0hqtxshqyGSKCAoTWwPu6QmWmtuk8hiZNkN6fytcz~j72m8U0~6tH8agUEOI5IZt8qGa-DUR6PMOGOddOOlGoCPRdoy1u2xur2~sXNdP0-kVoVvZccAvl2xygDDHi8BVwJgqKdLLeWrShDOvGUJkGuBXP0yrChM5t3-x35WrYJl-ESvEqvKozPzwsspu8zep2v4YpMqP0ZJ-8vxyGPSBgdrg33MxflZU3GDk1g4KwB2objZx51Jmhva7tmuxEUef75nedG-4WkJPZB0OvvySK9tF9yhkosqX~B6mdXlQ__',
    badge: 'Quase Lotado',
  },
  {
    id: 3,
    title: 'Visita Noturna - Mirante Iluminado',
    date: '04 de Fevereiro',
    time: '19:00',
    location: 'Boa Vista, RR',
    capacity: 80,
    available: 35,
    price: 49.9,
    image: 'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-1_1770038877000_na1fn_aGVyby1taXJhbnRlLW5pZ2h0.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvY3Q1aWloMTNyUkVKelZMOEJVUXhaZi9zYW5kYm94L1lOM2N2VnJEZktKWFVlWTdwcGlHczQtaW1nLTFfMTc3MDAzODg3NzAwMF9uYTFmbl9hR1Z5YnkxdGFYSmhiblJsTFc1cFoyaDAucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=pIOIxCA5M57hRah89ibR4cZE1RyaT8-OeDWhzuE~-YJ8L-2GXnyH2-ZoBQ6MsQQIvDBP3U9lgwEYyry~bHyTpR2hZxxnmg3DMYBqfGdGf3BJpEfVlSSzwXYcCxY4NpR13q9AFI5ZPnJGGd-jZviQXlkLPOj~cgILMywIJg8DUuNWhuL~0856McTGRENQtpXAoKokvhChXtRmNPL~OlcUa1qZF7b~dnTO85VsshMnJYXN6~z9BX1ZhEgnbos0PbxfpcmWfjiMTPmROuylngZ4hgkmVqfewpuDUGfLseTfDeztGVCdl8hV0BuRMmM5SGtZzeHj1d2yyZvDX2NVQWpYtg__',
  },
  {
    id: 4,
    title: 'Agendamento em Grupo',
    date: '05 de Fevereiro',
    time: '16:00',
    location: 'Boa Vista, RR',
    capacity: 200,
    available: 150,
    price: 29.9,
    image: 'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-2_1770038910000_na1fn_aGVyby1taXJhbnRlLXN1bnNldA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvY3Q1aWloMTNyUkVKelZMOEJVUXhaZi9zYW5kYm94L1lOM2N2VnJEZktKWFVlWTdwcGlHczQtaW1nLTJfMTc3MDAzODkxMDAwMF9uYTFmbl9hR1Z5YnkxdGFYSmhiblJsTFhOMWJuTmxkQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=FfdXi1NM8V2RSw2vOGUPRNYRinUox7uu2YIZ8dtGIlg43n0hqtxshqyGSKCAoTWwPu6QmWmtuk8hiZNkN6fytcz~j72m8U0~6tH8agUEOI5IZt8qGa-DUR6PMOGOddOOlGoCPRdoy1u2xur2~sXNdP0-kVoVvZccAvl2xygDDHi8BVwJgqKdLLeWrShDOvGUJkGuBXP0yrChM5t3-x35WrYJl-ESvEqvKozPzwsspu8zep2v4YpMqP0ZJ-8vxyGPSBgdrg33MxflZU3GDk1g4KwB2objZx51Jmhva7tmuxEUef75nedG-4WkJPZB0OvvySK9tF9yhkosqX~B6mdXlQ__',
  },
];

export default function FeaturedEventsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#F5F5F5] to-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="heading text-[#0F3460] mb-2">Eventos em Destaque</h2>
            <p className="text-gray-600">Confira as melhores experiências disponíveis agora</p>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={goToPrevious}
              className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-[#D4AF37] transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 text-[#0F3460]" />
            </button>
            <button
              onClick={goToNext}
              className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-[#D4AF37] transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5 text-[#0F3460]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </div>
    </section>
  );
}
