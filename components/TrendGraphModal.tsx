import React, { useState, useEffect } from 'react';

interface KeywordWithMetadata {
  keyword: string;
  searchVolume: string;
  trendingRank: number;
  userIntent?: string;
  competition?: string;
  cpc?: string;
  strategicInsight?: string;
}

interface TrendGraphModalProps {
    keyword: KeywordWithMetadata;
    onClose: () => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

export const TrendGraphModal: React.FC<TrendGraphModalProps> = ({ keyword, onClose }) => {
    const [isCopied, setIsCopied] = useState(false);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const handleCopy = () => {
        navigator.clipboard.writeText(keyword.keyword);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const getVolumeClass = (volume: string) => {
      const baseClass = "inline-block text-sm font-semibold px-3 py-1 rounded-full";
      switch (volume?.toLowerCase()) {
          case 'high':
              return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
          case 'medium':
              return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
          case 'low':
              return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
          default:
              return `${baseClass} bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-300`;
      }
    };

    const getCompetitionClass = (competition?: string) => {
        const baseClass = "inline-block text-sm font-semibold px-3 py-1 rounded-full";
        switch (competition?.toLowerCase()) {
            case 'high':
                return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
            case 'medium':
                return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
            case 'low':
                return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
            default:
                return `${baseClass} bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-300`;
        }
    };
    
    const getIntentClass = (intent?: string) => {
        const baseClass = "inline-block text-sm font-semibold px-3 py-1 rounded-full";
        switch (intent?.toLowerCase()) {
            case 'informational':
                return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
            case 'navigational':
                return `${baseClass} bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300`;
            case 'commercial':
                return `${baseClass} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300`;
            case 'transactional':
                return `${baseClass} bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300`;
            default:
                return `${baseClass} bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-300`;
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-fast"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trend-modal-title"
        >
            <div 
                className="bg-orange-50 dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 border border-amber-200 dark:border-zinc-700 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h2 id="trend-modal-title" className="text-sm text-zinc-500 dark:text-zinc-400">Trending Details for</h2>
                        <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 break-words">
                            "{keyword.keyword}"
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 -mt-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full transition-colors" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="mt-6">
                    <div className="flex justify-between items-baseline mb-2">
                         <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">Trending Rank</h3>
                         <p className="text-lg font-bold text-amber-500 dark:text-amber-400">{keyword.trendingRank}<span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">/10</span></p>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-4 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-width duration-500 ease-out" 
                            style={{ width: `${(keyword.trendingRank / 10) * 100}%` }}
                            role="progressbar"
                            aria-valuenow={keyword.trendingRank}
                            aria-valuemin={0}
                            aria-valuemax={10}
                        />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Search Volume</h3>
                        <div className={getVolumeClass(keyword.searchVolume)}>{keyword.searchVolume}</div>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Competition</h3>
                        <div className={getCompetitionClass(keyword.competition)}>{keyword.competition || 'N/A'}</div>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-2">User Intent</h3>
                        <div className={getIntentClass(keyword.userIntent)}>{keyword.userIntent || 'N/A'}</div>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Estimated CPC</h3>
                        <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{keyword.cpc || 'N/A'}</p>
                    </div>
                </div>

                {keyword.strategicInsight && (
                    <div className="mt-6 border-t border-amber-200 dark:border-zinc-700 pt-6">
                        <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            Strategic Insight
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {keyword.strategicInsight}
                        </p>
                    </div>
                )}


                <div className="mt-8 border-t border-amber-200 dark:border-zinc-700 pt-6 flex justify-end">
                    <button
                        onClick={handleCopy}
                        className="w-full sm:w-auto flex items-center justify-center px-6 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
                    >
                        {isCopied ? <CheckIcon/> : <CopyIcon/>}
                        {isCopied ? 'Copied!' : 'Copy Keyword'}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeInFast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast { animation: fadeInFast 0.2s ease-out forwards; }

                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};