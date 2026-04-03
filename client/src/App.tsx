import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MapPage } from './pages/MapPage';
import { GearPage } from './pages/GearPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { OfflineBanner } from './components/shared/OfflineBanner';
import { SearchBar } from './components/search/SearchBar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

type Tab = 'map' | 'gear' | 'trip';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'map', label: 'Find Spots', icon: '🗺️' },
  { id: 'gear', label: 'Gear', icon: '🎒' },
  { id: 'trip', label: 'My Trip', icon: '📍' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen bg-stone-950 text-stone-100 overflow-hidden">
        <OfflineBanner />
        <SearchBar />

        {/* Main content */}
        <main className="flex-1 overflow-hidden relative">
          <div className={activeTab === 'map' ? 'block w-full h-full' : 'hidden'}>
            <MapPage />
          </div>
          <div className={activeTab === 'gear' ? 'block w-full h-full' : 'hidden'}>
            <GearPage />
          </div>
          <div className={activeTab === 'trip' ? 'block w-full h-full' : 'hidden'}>
            <TripPlannerPage />
          </div>
        </main>

        {/* Bottom nav */}
        <nav className="flex-shrink-0 bg-stone-900 border-t border-stone-800 safe-area-bottom">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-amber-400'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </QueryClientProvider>
  );
}
