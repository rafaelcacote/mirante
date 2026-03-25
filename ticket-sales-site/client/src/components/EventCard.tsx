import { MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  available: number;
  price: number;
  image: string;
  badge?: string;
}

export default function EventCard({
  title,
  date,
  time,
  location,
  capacity,
  available,
  price,
  image,
  badge,
}: EventCardProps) {
  const occupancyPercentage = ((capacity - available) / capacity) * 100;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {badge && (
          <div className="absolute top-4 right-4 bg-[#D4AF37] text-[#0F3460] px-3 py-1 rounded-full text-sm font-semibold">
            {badge}
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{date} às {time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">{available} de {capacity} lugares</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">Ocupação</span>
            <span className="text-xs font-semibold text-[#0F3460]">{Math.round(occupancyPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#2D6A4F] to-[#0F3460] h-2 rounded-full transition-all duration-300"
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 mb-1">A partir de</p>
            <p className="text-2xl font-bold text-[#0F3460]">R$ {price.toFixed(2)}</p>
          </div>
          <Button className="bg-[#D4AF37] text-[#0F3460] hover:bg-white font-semibold flex items-center gap-2">
            Comprar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
