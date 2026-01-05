import React, { useState, useEffect } from 'react';
import { HomePage } from './features/HomePage';
import { OptimizerPage } from './features/OptimizerPage';
import { AccessPage } from './features/AccessPage';
import { AboutPage } from './features/AboutPage';
import { checkAdminAuthentication, loginAdmin, logoutAdmin } from './services/authService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ParticleBackground } from './components/ParticleBackground';

const App: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [page, setPage] = useState('home');
  const [initialOptimizerTab, setInitialOptimizerTab] = useState('seo');
  const [redirectInfo, setRedirectInfo] = useState<{ page: string; tab?: string } | null>(null);
  
  // Authentication states
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsAuthLoading(true);
      const adminAuthStatus = checkAdminAuthentication();
      setIsAdminAuthenticated(adminAuthStatus);
      setIsAuthLoading(false);
    };
    verifyAuth();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  
  const navigateTo = (targetPage: string, tab?: string) => {
    window.scrollTo(0, 0); // Scroll to top on navigation
    if (targetPage === 'optimizer' && !isAdminAuthenticated) {
        setRedirectInfo({ page: 'optimizer', tab: tab || 'seo' });
        setPage('login');
    } else {
        setInitialOptimizerTab(tab || 'seo');
        setPage(targetPage);
    }
  };
  
  const handleAdminLoginSuccess = (rememberMe: boolean) => {
    loginAdmin(rememberMe);
    setIsAdminAuthenticated(true);
    if (redirectInfo) {
      setInitialOptimizerTab(redirectInfo.tab || 'seo');
      setPage(redirectInfo.page);
      setRedirectInfo(null);
    } else {
      setPage('optimizer');
    }
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdminAuthenticated(false);
    setPage('home');
  };

  const renderPage = () => {
      if (isAuthLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner message="Initializing Security..." />
            </div>
          );
      }

      if (page === 'about') {
        return <AboutPage 
                theme={theme} 
                toggleTheme={toggleTheme} 
                navigateToHome={() => navigateTo('home')} 
               />;
      }
      
      if (page === 'login') {
        return <AccessPage 
                onAdminAuthenticated={handleAdminLoginSuccess}
                theme={theme} 
                toggleTheme={toggleTheme}
                navigateToHome={() => navigateTo('home')}
              />;
      }
      
      if (page === 'optimizer') {
        if (!isAdminAuthenticated) {
            return <AccessPage 
                onAdminAuthenticated={handleAdminLoginSuccess}
                theme={theme} 
                toggleTheme={toggleTheme}
                navigateToHome={() => navigateTo('home')}
              />;
        }
        return <OptimizerPage 
              theme={theme} 
              toggleTheme={toggleTheme} 
              navigateToHome={() => navigateTo('home')} 
              initialTab={initialOptimizerTab}
              logout={handleAdminLogout}
              isAdminAuthenticated={isAdminAuthenticated}
            />
      }

      // Default to home page
      return (
        <HomePage 
          theme={theme} 
          toggleTheme={toggleTheme} 
          navigateToOptimizer={(tab) => navigateTo('optimizer', tab)} 
          navigateToLogin={() => navigateTo('login')}
          navigateToAbout={() => navigateTo('about')}
          isAdminAuthenticated={isAdminAuthenticated}
          logout={handleAdminLogout}
        />
      );
  };
  
  return (
    <>
      <ParticleBackground />
      <div className="relative z-0">
        {renderPage()}
      </div>
    </>
  );
};

export default App;