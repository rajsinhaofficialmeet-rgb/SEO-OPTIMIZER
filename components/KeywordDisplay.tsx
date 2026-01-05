import React, { useState, useCallback, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TrendGraphModal } from './TrendGraphModal';
import { SchedulePostModal } from './SchedulePostModal';
import { CalendarIcon, GoogleMapsIcon } from './PlatformIcons';

interface KeywordWithMetadata {
  keyword: string;
  searchVolume: string;
  trendingRank: number;
  density?: number;
  userIntent?: string;
  competition?: string;
  cpc?: string;
}

// Type guard to check if an item is a KeywordWithMetadata object
function isKeywordWithMetadata(item: any): item is KeywordWithMetadata {
    return typeof item === 'object' && item !== null && 'keyword' in item && 'searchVolume' in item && 'trendingRank' in item;
}

interface ResultsDisplayProps {
  results: Record<string, (string | KeywordWithMetadata)[]>;
  platformInfo?: { platform: string; icon: string; userInput: string; language?: string };
  groundingSources?: any[];
}


const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const PngIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const LoadingSpinnerIconSmall: React.FC = () => (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, platformInfo, groundingSources }) => {
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordWithMetadata | null>(null);
  const [justCopied, setJustCopied] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<null | 'png' | 'pdf'>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const { platform } = platformInfo || {};
  const isSchedulable = platform && !platform.toLowerCase().includes('seo') && platform.toLowerCase() !== 'website seo';


  const handleKeywordClick = (item: string | KeywordWithMetadata) => {
    if (isKeywordWithMetadata(item)) {
        setSelectedKeyword(item);
    } else {
        // For simple strings like title suggestions, copy directly
        navigator.clipboard.writeText(item);
        setJustCopied(item);
        setTimeout(() => setJustCopied(null), 2000);
    }
  };
  
  const allKeywordsText = useMemo(() => {
    return Object.values(results)
      .flat()
      .map(item => (isKeywordWithMetadata(item) ? item.keyword : item))
      .join(', ');
  }, [results]);

  const handleCopyAll = useCallback(() => {
    navigator.clipboard.writeText(allKeywordsText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [allKeywordsText]);
  
  const handleDownload = useCallback(async (format: 'png' | 'pdf') => {
    if (!resultsContainerRef.current) return;
    
    setIsDownloading(format);
    
    const originalContainer = resultsContainerRef.current;
    
    // Create a temporary container for a structured export layout
    const exportContainer = document.createElement('div');
    const isDark = document.documentElement.classList.contains('dark');
    
    // Set base styles for the container to render it off-screen
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = '0';
    exportContainer.style.width = `${originalContainer.offsetWidth}px`;
    exportContainer.style.padding = '24px';
    exportContainer.style.backgroundColor = isDark ? '#0c0a09' : '#fff7ed'; // stone-950 or orange-50
    exportContainer.style.color = isDark ? '#e7e5e4' : '#1c1917'; // zinc-200 or zinc-900

    // Header element
    const header = document.createElement('h1');
    header.innerText = 'Mentors Eduserv';
    header.style.color = '#DD6B20'; // Dark Orange
    header.style.fontWeight = 'bold';
    header.style.fontSize = '24px';
    header.style.textAlign = 'center';
    header.style.marginBottom = '20px';

    // Clone the results content to avoid visual glitches on the main page
    const contentClone = originalContainer.cloneNode(true) as HTMLElement;
    // Reset card-specific styles on the clone for a clean look inside the export container
    contentClone.style.background = 'transparent';
    contentClone.style.border = 'none';
    contentClone.style.boxShadow = 'none';
    contentClone.style.backdropFilter = 'none'; // Remove blur for a solid background
    // FIX: Add type assertion to handle non-standard webkitBackdropFilter property for Safari compatibility.
    (contentClone.style as any).webkitBackdropFilter = 'none';

    // Footer element
    const footer = document.createElement('p');
    footer.innerText = 'Mentors Eduserv';
    footer.style.color = '#DD6B20'; // Dark Orange
    footer.style.fontWeight = 'bold';
    footer.style.fontSize = '16px';
    footer.style.textAlign = 'center';
    footer.style.marginTop = '20px';

    // Assemble the export container
    exportContainer.appendChild(header);
    exportContainer.appendChild(contentClone);
    exportContainer.appendChild(footer);

    // Add to DOM for html2canvas to render
    document.body.appendChild(exportContainer);

    try {
        const canvas = await html2canvas(exportContainer, {
            useCORS: true,
            scale: 2, // Increase resolution for better quality
        });

        if (format === 'png') {
            const link = document.createElement('a');
            link.download = 'generated-results.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else {
            const imgData = canvas.toDataURL('image/png');
            // Use pixel dimensions for jsPDF, as the canvas is in pixels
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: [canvas.width, canvas.height],
                hotfixes: ['px_scaling'],
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('generated-results.pdf');
        }
    } catch (err) {
        console.error(`Failed to download ${format}:`, err);
        // Here you could show an error toast to the user
    } finally {
        // Clean up the temporary container from the DOM
        document.body.removeChild(exportContainer);
        setIsDownloading(null);
    }
  }, []);


  const getVolumeClass = (volume: string) => {
    const baseClass = "text-xs font-semibold px-2 py-0.5 rounded-full";
    switch (volume?.toLowerCase()) {
        case 'high':
            return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
        case 'medium':
            return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
        case 'low':
            return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
        default:
            return `${baseClass} bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-300`;
    }
  };
  
  const getCompetitionClass = (competition?: string) => {
    const baseClass = "text-xs font-semibold px-2 py-0.5 rounded-full";
    switch (competition?.toLowerCase()) {
        case 'high':
            return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
        case 'medium':
            return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
        case 'low':
            return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
        default:
            return `hidden`;
    }
  };
  
  const getDensityClass = (density?: number) => {
    const baseClass = "text-xs font-semibold px-2 py-0.5 rounded-full";
    if (typeof density !== 'number') return '';
    
    if (density > 2.5) { // High density (potential stuffing)
        return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
    } else if (density > 0) { // Good density
        return `${baseClass} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300`;
    }
    return `${baseClass} bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300`;
  };

  const renderKeywords = (keywords: (string | KeywordWithMetadata)[]) => (
    <div className="flex flex-wrap gap-3">
      {keywords.map((item, index) => {
          const keywordText = isKeywordWithMetadata(item) ? item.keyword : item;
          const hasMetadata = isKeywordWithMetadata(item);

          return (
             <button
                key={`${keywordText}-${index}`}
                onClick={() => handleKeywordClick(item)}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-100/50 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-medium hover:bg-amber-100 dark:hover:bg-zinc-600 transition-all duration-200 group"
                title={hasMetadata ? "Click for trend details" : "Click to copy"}
             >
                <span>{keywordText}</span>
                {hasMetadata && (
                    <>
                        <span className={getVolumeClass(item.searchVolume)} title={`Search Volume: ${item.searchVolume}`}>{item.searchVolume}</span>
                        {item.competition && <span className={getCompetitionClass(item.competition)} title={`Competition: ${item.competition}`}>{item.competition}</span>}
                        <span className="text-xs font-bold text-amber-500 dark:text-amber-400 flex items-center" title={`Trending Rank: ${item.trendingRank}/10`}>
                            <span className="mr-0.5" aria-hidden="true">🔥</span>
                            {item.trendingRank}
                        </span>
                        {typeof item.density === 'number' && (
                            <span className={getDensityClass(item.density)} title={`Keyword Density: ${item.density.toFixed(2)}%`}>
                                {item.density > 0.001 ? `${item.density.toFixed(2)}%` : `0%`}
                            </span>
                        )}
                    </>
                )}
                {!hasMetadata && (
                  <span className="text-zinc-400 group-hover:text-amber-500 transition-colors">
                    {justCopied === keywordText ? <CheckIcon /> : <CopyIcon />}
                  </span>
                )}
             </button>
          );
      })}
    </div>
  );

  const renderGroundingSources = () => (
    <div className="mt-6 pt-6 border-t border-amber-200 dark:border-zinc-700">
      <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-3">Data Sources</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">These Google Maps places were used to ground the AI's response for better local accuracy.</p>
      <div className="space-y-2">
        {groundingSources!.map((source, index) => {
          const uri = source.maps?.uri;
          const title = source.maps?.title;
          if (uri && title) {
            return (
              <a 
                key={index}
                href={uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 p-2 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg hover:bg-amber-100/60 dark:hover:bg-zinc-700/80 transition-colors"
              >
                <GoogleMapsIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</span>
              </a>
            );
          }
          return null;
        })}
      </div>
    </div>
  );

  return (
    <>
    <div className="w-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700 animate-fade-in-subtle">
      <div ref={resultsContainerRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Generated Results</h2>
            <div className="flex items-center gap-2 flex-wrap justify-end">
               {isSchedulable && (
                <button
                    onClick={() => setIsScheduling(true)}
                    className="px-3 py-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-zinc-700 rounded-lg hover:bg-amber-100 dark:hover:bg-zinc-600 transition-colors duration-200 flex items-center gap-1.5"
                    aria-label="Add to calendar"
                >
                    <CalendarIcon />
                    <span>Schedule</span>
                </button>
              )}
              <button
                onClick={handleCopyAll}
                className="px-3 py-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-zinc-700 rounded-lg hover:bg-amber-100 dark:hover:bg-zinc-600 transition-colors duration-200 flex items-center gap-1.5"
              >
                {copiedAll ? <CheckIcon /> : <CopyIcon />}
                {copiedAll ? 'Copied!' : 'Copy All'}
              </button>
              <button
                onClick={() => handleDownload('png')}
                disabled={isDownloading !== null}
                className="px-3 py-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-zinc-700 rounded-lg hover:bg-amber-100 dark:hover:bg-zinc-600 transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
                aria-label="Download as PNG"
              >
                {isDownloading === 'png' ? <LoadingSpinnerIconSmall /> : <PngIcon />}
                <span>{isDownloading === 'png' ? 'Saving...' : 'PNG'}</span>
              </button>
               <button
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading !== null}
                className="px-3 py-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-zinc-700 rounded-lg hover:bg-amber-100 dark:hover:bg-zinc-600 transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
                aria-label="Download as PDF"
              >
                {isDownloading === 'pdf' ? <LoadingSpinnerIconSmall /> : <PdfIcon />}
                <span>{isDownloading === 'pdf' ? 'Saving...' : 'PDF'}</span>
              </button>
            </div>
          </div>
            {/* FIX: Refactored to use Object.keys to ensure correct type inference for keywords. */}
            {Object.keys(results).map((title) => (
                <div key={title} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-3 capitalize">{title.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    {renderKeywords(results[title])}
                </div>
            ))}
            {groundingSources && groundingSources.length > 0 && renderGroundingSources()}
      </div>
    </div>
    {selectedKeyword && (
        <TrendGraphModal 
            keyword={selectedKeyword}
            onClose={() => setSelectedKeyword(null)}
        />
    )}
    {isScheduling && platformInfo && (
        <SchedulePostModal
            isOpen={isScheduling}
            onClose={() => setIsScheduling(false)}
            postData={{ ...platformInfo, results }}
        />
    )}
    </>
  );
};