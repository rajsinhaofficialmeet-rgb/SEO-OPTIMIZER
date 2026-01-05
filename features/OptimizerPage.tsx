import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SeoGenerator } from './SeoGenerator';
import { YouTubeGenerator } from './YouTubeGenerator';
import { LinkedInGenerator } from './LinkedInGenerator';
import { InstagramGenerator } from './InstagramGenerator';
import { FacebookGenerator } from './FacebookGenerator';
import { HistoryDisplay } from './HistoryDisplay';
import { GoogleIcon, YouTubeIcon, LinkedInIcon, InstagramIcon, FacebookIcon, HistoryIcon, CalendarIcon } from '../components/PlatformIcons';
import { CalendarPage } from './CalendarPage';

const mainTabs = [
  { id: 'seo', name: 'Website SEO', icon: <GoogleIcon />, component: <SeoGenerator /> },
  { id: 'youtube', name: 'YouTube', icon: <YouTubeIcon />, component: <YouTubeGenerator /> },
  { id: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon />, component: <LinkedInGenerator /> },
  { id: 'instagram', name: 'Instagram', icon: <InstagramIcon />, component: <InstagramGenerator /> },
  { id: 'facebook', name: 'Facebook', icon: <FacebookIcon />, component: <FacebookGenerator /> },
];

const utilityTabs = [
  { id: 'history', name: 'History', icon: <HistoryIcon />, component: <HistoryDisplay /> },
  { id: 'calendar', name: 'Calendar', icon: <CalendarIcon />, component: <CalendarPage /> },
];

const allTabs = [...mainTabs, ...utilityTabs];

interface OptimizerPageProps {
    theme: string;
    toggleTheme: () => void;
    navigateToHome: () => void;
    initialTab?: string;
    logout: () => void;
    isAdminAuthenticated: boolean;
}

export const OptimizerPage: React.FC<OptimizerPageProps> = ({ theme, toggleTheme, navigateToHome, initialTab = 'seo', logout, isAdminAuthenticated }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const ActiveComponent = allTabs.find(tab => tab.id === activeTab)?.component;

  useEffect(() => {
    // Scroll to top when page/component loads
    window.scrollTo(0, 0);
  }, []);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const isUtilityTab = utilityTabs.some(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen flex flex-col items-center text-zinc-800 dark:text-zinc-200 font-sans">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onLogoClick={navigateToHome} 
        onHistoryClick={() => handleTabClick('history')}
        onCalendarClick={() => handleTabClick('calendar')}
        activeTab={activeTab}
        onLogout={logout}
        isAdminAuthenticated={isAdminAuthenticated}
      />
      <main className="w-full flex flex-col items-center flex-grow">
        <section id="app-section" className="w-full p-4 sm:p-6 lg:p-8 mt-8 sm:mt-12">
           {!isUtilityTab && (
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  AI Content Optimizer
                </h2>
                <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                  Select a platform and provide some details to generate optimized content instantly.
                </p>
              </div>
           )}
          <div className="mb-8 flex justify-center flex-wrap gap-2 sm:gap-4 pb-4">
            {mainTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-zinc-600 dark:text-zinc-300 bg-white/60 dark:bg-zinc-800/50 backdrop-blur-sm hover:bg-amber-100/50 dark:hover:bg-zinc-700/50 shadow-sm border border-amber-200 dark:border-zinc-700'
                }`}
                aria-pressed={activeTab === tab.id}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="animate-fade-in-subtle" key={activeTab}>
                {ActiveComponent}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
