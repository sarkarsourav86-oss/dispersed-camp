import { useState, useCallback, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Map, HeartFill, HouseDoorFill } from 'react-bootstrap-icons';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { OfflineBanner } from './components/shared/OfflineBanner';
import { useSpotsStore } from './store';
import type { CampSpot } from './types';
import type { ComponentType } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

type Tab = 'home' | 'find' | 'trip';

const TABS: { id: Tab; label: string; Icon: ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'home', label: 'Home', Icon: HouseDoorFill },
  { id: 'find', label: 'Find Spots', Icon: Map },
  { id: 'trip', label: 'My Trip', Icon: HeartFill },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [mapMounted, setMapMounted] = useState(false);
  const { selectSpot } = useSpotsStore();

  const handleNavigateToMap = useCallback(() => {
    setMapMounted(true);
    setActiveTab('find');
  }, []);

  const handleSelectSpotFromHome = useCallback((spot: CampSpot) => {
    selectSpot(spot);
    setMapMounted(true);
    setActiveTab('find');
  }, [selectSpot]);

  const mapResetRef = useRef<(() => void) | null>(null);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'find') {
      setMapMounted(true);
      mapResetRef.current?.();
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen bg-stone-950 text-stone-100 overflow-hidden">
        <OfflineBanner />

        {/* Main content */}
        <main className="flex-1 overflow-hidden relative">
          {/* Home page */}
          <div className={activeTab === 'home' ? 'block w-full h-full' : 'hidden'}>
            <HomePage
              onNavigateToMap={handleNavigateToMap}
              onSelectSpot={handleSelectSpotFromHome}
            />
          </div>

          {/* Map page — mounted on first navigation, then kept alive */}
          {mapMounted && (
            <div className={activeTab === 'find' ? 'block w-full h-full' : 'hidden'}>
              <MapPage onResetView={(reset) => { mapResetRef.current = reset; }} />
            </div>
          )}

          {/* Trip page */}
          <div className={activeTab === 'trip' ? 'block w-full h-full' : 'hidden'}>
            <TripPlannerPage />
          </div>
        </main>

        {/* Bottom nav */}
        <nav className="flex-shrink-0 bg-stone-900 border-t border-stone-800 pb-2 safe-area-bottom">
          <div className="flex">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
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
