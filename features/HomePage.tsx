import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { Features } from '../components/Features';
import { GoogleIcon, YouTubeIcon, LinkedInIcon, InstagramIcon } from '../components/PlatformIcons';

const iconComponents = [InstagramIcon, YouTubeIcon, LinkedInIcon, GoogleIcon];

const FloatingIcons = () => {
    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            {Array.from({ length: 15 }).map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 60 + 20}px`,
                    height: `${Math.random() * 60 + 20}px`,
                    animation: `float ${Math.random() * 20 + 25}s linear infinite`,
                    animationDelay: `${Math.random() * 15}s`,
                };
                const IconComponent = iconComponents[i % iconComponents.length];
                return (
                    <span 
                        key={i}
                        className="absolute bottom-[-100px] text-amber-400/10 dark:text-orange-400/10"
                        style={style}
                    >
                      <IconComponent className="w-full h-full" />
                    </span>
                );
            })}
        </div>
    );
};

const FloatingBubbles = () => {
    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            {Array.from({ length: 20 }).map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 100 + 20}px`,
                    height: `${Math.random() * 100 + 20}px`,
                    animation: `bubble-float ${Math.random() * 25 + 20}s linear infinite`,
                    animationDelay: `${Math.random() * 20}s`,
                };
                return (
                    <span 
                        key={i}
                        className="absolute bottom-[-150px] bg-orange-400/5 dark:bg-orange-500/5 rounded-full filter blur-md"
                        style={style}
                    />
                );
            })}
        </div>
    );
};

interface HomePageProps {
    theme: string;
    toggleTheme: () => void;
    navigateToOptimizer: (tab?: string) => void;
    navigateToLogin: () => void;
    navigateToAbout: () => void;
    isAdminAuthenticated: boolean;
    logout: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ theme, toggleTheme, navigateToOptimizer, navigateToLogin, navigateToAbout, isAdminAuthenticated, logout }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center text-zinc-800 dark:text-zinc-200 font-sans">
      <FloatingIcons />
      <FloatingBubbles />
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isAdminAuthenticated={isAdminAuthenticated}
        onLogin={navigateToLogin}
        onLogout={logout}
        onHistoryClick={() => navigateToOptimizer('history')}
        onCalendarClick={() => navigateToOptimizer('calendar')}
        onAboutClick={navigateToAbout}
      />
      <main className="w-full flex flex-col items-center">
        <Hero navigateToOptimizer={() => navigateToOptimizer('seo')} />
        <HowItWorks />
        <Features navigateToOptimizer={navigateToOptimizer} />
      </main>
      <Footer />
    </div>
  );
};