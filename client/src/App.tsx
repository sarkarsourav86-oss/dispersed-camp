import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Map, HeartFill } from 'react-bootstrap-icons';
import { MapPage } from './pages/MapPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { OfflineBanner } from './components/shared/OfflineBanner';
import type { ComponentType } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

type Tab = 'map' | 'trip';

const TABS: { id: Tab; label: string; Icon: ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'map', label: 'Find Spots', Icon: Map },
  { id: 'trip', label: 'My Trip', Icon: HeartFill },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen bg-stone-950 text-stone-100 overflow-hidden">
        <OfflineBanner />

        {/* Main content */}
        <main className="flex-1 overflow-hidden relative">
          <div className={activeTab === 'map' ? 'block w-full h-full' : 'hidden'}>
            <MapPage />
          </div>
          <div className={activeTab === 'trip' ? 'block w-full h-full' : 'hidden'}>
            <TripPlannerPage />
          </div>
        </main>

        {/* Bottom nav */}
        <nav className="flex-shrink-0 bg-stone-900 border-t border-stone-800 safe-area-bottom">
          <div className="flex">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
                    active ? 'text-amber-400' : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  <tab.Icon size={20} className={active ? 'text-amber-400' : 'text-stone-500'} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </QueryClientProvider>
  );
}
