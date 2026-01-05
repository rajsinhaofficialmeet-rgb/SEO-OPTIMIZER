import React from 'react';
import { HistoryIcon, CalendarIcon, InfoIcon } from './PlatformIcons';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const LoginIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
    isAdminAuthenticated?: boolean;
    onLogoClick?: () => void;
    onHistoryClick?: () => void;
    onCalendarClick?: () => void;
    onAboutClick?: () => void;
    onLogin?: () => void;
    onLogout?: () => void;
    activeTab?: string;
    onHomeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, isAdminAuthenticated, onLogoClick, onHistoryClick, onCalendarClick, onAboutClick, onLogin, onLogout, activeTab, onHomeClick }) => {
  const LogoContainer = onLogoClick ? 'button' : 'div';
  const logoContainerProps = onLogoClick 
    ? { onClick: onLogoClick, className: "flex items-center cursor-pointer group" } 
    : { className: "flex items-center group" };

  const iconButtonBaseClass = "p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-50 dark:focus:ring-offset-stone-950 focus:ring-amber-500";
  const iconButtonInactiveClass = "bg-amber-200/50 dark:bg-zinc-700/50 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-zinc-700";
  const iconButtonActiveClass = "bg-amber-600 text-white shadow-md";

  return (
    <header className="py-4 w-full">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <LogoContainer {...logoContainerProps}>
            <span 
                className="text-3d-gradient text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 dark:from-amber-400 dark:via-orange-300 dark:to-amber-400 hidden sm:inline"
                style={{ backgroundSize: '200% auto', animation: 'gradient-pan 3s linear infinite' }}
            >
            Mentors Eduserv
            </span>
        </LogoContainer>
        <div className="flex items-center gap-2 sm:gap-4">
            {onHomeClick && (
                <button
                    onClick={onHomeClick}
                    className={`${iconButtonBaseClass} ${iconButtonInactiveClass}`}
                    aria-label="Go to Homepage"
                >
                    <HomeIcon />
                </button>
            )}
            {onHistoryClick && (
                <button
                    onClick={onHistoryClick}
                    className={`${iconButtonBaseClass} ${activeTab === 'history' ? iconButtonActiveClass : iconButtonInactiveClass}`}
                    aria-label="View History"
                >
                    <HistoryIcon className="h-6 w-6" />
                </button>
            )}
             {onCalendarClick && (
                <button
                    onClick={onCalendarClick}
                    className={`${iconButtonBaseClass} ${activeTab === 'calendar' ? iconButtonActiveClass : iconButtonInactiveClass}`}
                    aria-label="View Calendar"
                >
                    <CalendarIcon className="h-6 w-6" />
                </button>
            )}
            {onAboutClick && (
                <button
                    onClick={onAboutClick}
                    className={`${iconButtonBaseClass} ${iconButtonInactiveClass}`}
                    aria-label="About this application"
                >
                    <InfoIcon />
                </button>
            )}
            <button
                onClick={toggleTheme}
                className={`${iconButtonBaseClass} ${iconButtonInactiveClass}`}
                aria-label="Toggle dark mode"
            >
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            {isAdminAuthenticated && onLogout && (
                 <button
                    onClick={onLogout}
                    className={`${iconButtonBaseClass} ${iconButtonInactiveClass}`}
                    aria-label="Logout"
                >
                    <LogoutIcon />
                </button>
            )}
            {!isAdminAuthenticated && onLogin && (
                 <button
                    onClick={onLogin}
                    className={`${iconButtonBaseClass} ${iconButtonInactiveClass}`}
                    aria-label="Login"
                >
                    <LoginIcon />
                </button>
            )}
        </div>
      </div>
    </header>
  );
};