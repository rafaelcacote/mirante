import { useState } from 'react';
import { Search, MapPin, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0F3460] to-[#2E8BC0] shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center">
              <span className="text-[#0F3460] font-bold text-lg">M</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg">Mirante</h1>
              <p className="text-[#D4AF37] text-xs font-semibold">Ingressos</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Buscar experiencias"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
              <Search className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Boa Vista</span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-white">
            <a href="#" className="text-sm font-medium hover:text-[#D4AF37] transition-colors">Meus Ingressos</a>
            <a href="#" className="text-sm font-medium hover:text-[#D4AF37] transition-colors">Criar Evento</a>
            <Button className="bg-[#D4AF37] text-[#0F3460] hover:bg-white font-semibold">Entrar</Button>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="md:hidden mt-4">
          <div className="w-full relative">
            <input
              type="text"
              placeholder="Buscar experiencias"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <Search className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D2A47] border-t border-white/10">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <a href="#" className="block text-white text-sm font-medium py-2 hover:text-[#D4AF37] transition-colors">
              Meus Ingressos
            </a>
            <a href="#" className="block text-white text-sm font-medium py-2 hover:text-[#D4AF37] transition-colors">
              Criar Evento
            </a>
            <Button className="w-full bg-[#D4AF37] text-[#0F3460] hover:bg-white font-semibold">Entrar</Button>
          </div>
        </div>
      )}
    </header>
  );
}
