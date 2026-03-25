import { useState } from 'react';
import { ChevronLeft, MapPin, Calendar, Users, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function EventDetails() {
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState('2026-02-02');

  const eventImage = 'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-2_1770038910000_na1fn_aGVyby1taXJhbnRlLXN1bnNldA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvY3Q1aWloMTNyUkVKelZMOEJVUXhaZi9zYW5kYm94L1lOM2N2VnJEZktKWFVlWTdwcGlHczQtaW1nLTJfMTc3MDAzODkxMDAwMF9uYTFmbl9hR1Z5YnkxdGFYSmhiblJsTFhOMWJuTmxkQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=FfdXi1NM8V2RSw2vOGUPRNYRinUox7uu2YIZ8dtGIlg43n0hqtxshqyGSKCAoTWwPu6QmWmtuk8hiZNkN6fytcz~j72m8U0~6tH8agUEOI5IZt8qGa-DUR6PMOGOddOOlGoCPRdoy1u2xur2~sXNdP0-kVoVvZccAvl2xygDDHi8BVwJgqKdLLeWrShDOvGUJkGuBXP0yrChM5t3-x35WrYJl-ESvEqvKozPzwsspu8zep2v4YpMqP0ZJ-8vxyGPSBgdrg33MxflZU3GDk1g4KwB2objZx51Jmhva7tmuxEUef75nedG-4WkJPZB0OvvySK9tF9yhkosqX~B6mdXlQ__';

  const price = 89.9;
  const total = price * quantity;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <button className="flex items-center gap-2 text-[#0F3460] hover:text-[#D4AF37] transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Details */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
                <img src={eventImage} alt="Event" className="w-full h-96 object-cover" />
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                <h1 className="display text-[#0F3460] mb-4">Experiência Premium - Pôr do Sol</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-[#0F3460]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Data</p>
                      <p className="font-semibold text-[#0F3460]">03 de Fev</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                      <Clock className="w-5 h-5 text-[#0F3460]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Horário</p>
                      <p className="font-semibold text-[#0F3460]">17:30</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-[#0F3460]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Local</p>
                      <p className="font-semibold text-[#0F3460]">Boa Vista, RR</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                      <Users className="w-5 h-5 text-[#0F3460]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Capacidade</p>
                      <p className="font-semibold text-[#0F3460]">50 pessoas</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="subheading text-[#0F3460] mb-4">Sobre o Evento</h2>
                  <p className="text-gray-600 mb-4">
                    Aproveite um momento inesquecível no Mirante Edileusa Lóz durante o pôr do sol. Esta experiência premium inclui acesso prioritário, guia especializado e bebidas refrescantes.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#2D6A4F] flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Acesso prioritário ao observatório</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#2D6A4F] flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Guia turístico especializado em português</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#2D6A4F] flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Bebidas refrescantes incluídas</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#2D6A4F] flex-shrink-0 mt-1" />
                      <span className="text-gray-700">Fotografia profissional do grupo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-[#0F3460] to-[#2E8BC0] rounded-2xl p-8 text-white sticky top-24 shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Reservar Ingressos</h3>

                <div className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Selecione a Data</label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="2026-02-02">02 de Fevereiro</option>
                      <option value="2026-02-03">03 de Fevereiro</option>
                      <option value="2026-02-04">04 de Fevereiro</option>
                      <option value="2026-02-05">05 de Fevereiro</option>
                    </select>
                  </div>

                  {/* Quantity Selection */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Quantidade de Ingressos</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white text-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-white/20 pt-6">
                    <div className="flex justify-between mb-2">
                      <span>Preço unitário</span>
                      <span>R$ {price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4 text-sm text-white/80">
                      <span>Quantidade</span>
                      <span>{quantity}x</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-white/20 pt-4">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full bg-[#D4AF37] text-[#0F3460] hover:bg-white font-bold text-base py-3">
                    Continuar para Pagamento
                  </Button>

                  <p className="text-xs text-white/70 text-center">
                    Você receberá confirmação por email após a compra
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
