import { useState } from 'react';
import { Sidebar } from '@/components/Layout/Sidebar';
import { LibraryPage } from '@/pages/Library';
import { CalendarPage } from '@/pages/Calendar';
import { RatingPage } from '@/pages/Rating';
import { RankingsPage } from '@/pages/Rankings';
import { QuotesPage } from '@/pages/Quotes';
import { CardsPage } from '@/pages/Cards';
import { DashboardPage } from '@/pages/Dashboard';
import { SettingsPage } from '@/pages/Settings';
import { TabType } from '@/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('library');

  const renderPage = () => {
    switch (activeTab) {
      case 'library':
        return <LibraryPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'rating':
        return <RatingPage />;
      case 'rankings':
        return <RankingsPage />;
      case 'quotes':
        return <QuotesPage />;
      case 'cards':
        return <CardsPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <LibraryPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-60 min-h-screen p-8">
        <div key={activeTab} className="animate-fade-in h-[calc(100vh-4rem)]">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
