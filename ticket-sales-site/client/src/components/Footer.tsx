import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#0F3460] to-[#0D2A47] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Sobre */}
          <div>
            <h3 className="font-bold text-lg mb-4">Mirante Ingressos</h3>
            <p className="text-gray-300 text-sm mb-4">
              Plataforma oficial de venda de ingressos para o Mirante Edileusa Lóz em Boa Vista.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-[#D4AF37] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#D4AF37] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#D4AF37] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Início</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Eventos</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Meus Ingressos</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Sobre</a></li>
            </ul>
          </div>

          {/* Informações */}
          <div>
            <h4 className="font-semibold mb-4">Informações</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-[#D4AF37]" />
                <span className="text-gray-300">(95) 3623-1234</span>
              </li>
              <li className="flex gap-2">
                <Mail className="w-4 h-4 flex-shrink-0 text-[#D4AF37]" />
                <span className="text-gray-300">info@miranteingressos.com</span>
              </li>
              <li className="flex gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 text-[#D4AF37]" />
                <span className="text-gray-300">Boa Vista, RR</span>
              </li>
            </ul>
          </div>

          {/* Horário */}
          <div>
            <h4 className="font-semibold mb-4">Horário de Funcionamento</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><span className="font-semibold">Quarta a Domingo</span></li>
              <li>15:00 - 21:00</li>
              <li className="pt-2 border-t border-gray-600 mt-2">
                <span className="text-[#D4AF37]">Ingressos Gratuitos</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <p>&copy; 2026 Mirante Ingressos. Todos os direitos reservados.</p>
            </div>
            <div className="flex gap-4 md:justify-end">
              <a href="#" className="hover:text-[#D4AF37] transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-[#D4AF37] transition-colors">Termos de Uso</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
