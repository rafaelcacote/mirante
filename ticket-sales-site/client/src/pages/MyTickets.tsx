import { Download, Share2, QrCode, Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const tickets = [
  {
    id: 1,
    eventName: 'Experiência Premium - Pôr do Sol',
    date: '03 de Fevereiro de 2026',
    time: '17:30',
    location: 'Boa Vista, RR',
    quantity: 2,
    status: 'Confirmado',
    confirmationCode: 'MIR-2026-001234',
    qrCode: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    eventName: 'Visita Diurna - Mirante Edileusa Lóz',
    date: '02 de Fevereiro de 2026',
    time: '15:00',
    location: 'Boa Vista, RR',
    quantity: 1,
    status: 'Confirmado',
    confirmationCode: 'MIR-2026-001233',
    qrCode: 'https://via.placeholder.com/150',
  },
];

export default function MyTickets() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="display text-[#0F3460] mb-2">Meus Ingressos</h1>
            <p className="text-gray-600 text-lg">Visualize e gerencie seus ingressos para os eventos</p>
          </div>

          {/* Tickets List */}
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8">
                  {/* Event Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-[#0F3460] mb-4">{ticket.eventName}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-sm">{ticket.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Ticket className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-sm">{ticket.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-sm">{ticket.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Users className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-sm">{ticket.quantity} ingresso(s)</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Código de Confirmação</p>
                      <p className="font-mono font-bold text-[#0F3460]">{ticket.confirmationCode}</p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <QrCode className="w-16 h-16 text-gray-300" />
                    </div>
                    <span className="text-xs text-gray-500">QR Code</span>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold mb-4">
                        {ticket.status}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full bg-[#0F3460] text-white hover:bg-[#0D2A47] flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Baixar PDF
                      </Button>
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {tickets.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhum ingresso encontrado</h3>
              <p className="text-gray-500 mb-6">Você ainda não comprou ingressos. Comece a explorar eventos agora!</p>
              <Button className="bg-[#D4AF37] text-[#0F3460] hover:bg-white font-semibold">
                Explorar Eventos
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
