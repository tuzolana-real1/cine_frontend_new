import { EmptyState } from '../ui/EmptyState';
import { Compass } from 'lucide-react';

export default function Explore() {
  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
      <h1 className="text-3xl font-bold mb-8">Explorar Catálogo</h1>
      <div className="flex-1 flex items-center justify-center">
        <EmptyState 
          icon={Compass}
          title="Em Construção"
          description="A página de exploração com filtros e pesquisa estará disponível em breve."
        />
      </div>
    </div>
  );
}
