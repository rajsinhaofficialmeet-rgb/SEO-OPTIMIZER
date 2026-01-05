
import React, { useState, useEffect, useCallback } from 'react';
import { ResultsDisplay } from '../components/KeywordDisplay';
import { MetaDescriptionDisplay } from '../components/MetaDescriptionDisplay';
import { SchemaMarkupDisplay } from '../components/SchemaMarkupDisplay';
import { InitialState } from '../components/InitialState';
import { GoogleIcon, YouTubeIcon, LinkedInIcon, InstagramIcon, FacebookIcon } from '../components/PlatformIcons';
import type { HistoryItem } from '../hooks/useGenerator';

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ExcelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
);

// FIX: Export PlatformIcon to allow re-use in other components.
export const PlatformIcon: React.FC<{ platform: string, fallbackIcon: string }> = ({ platform, fallbackIcon }) => {
    const iconProps = { className: "w-6 h-6" };
    switch (platform) {
        case 'Website SEO':
            return <GoogleIcon {...iconProps} />;
        case 'YouTube':
            return <YouTubeIcon {...iconProps} />;
        case 'LinkedIn':
            return <LinkedInIcon {...iconProps} />;
        case 'Instagram':
            return <InstagramIcon {...iconProps} />;
        case 'Facebook':
            return <FacebookIcon {...iconProps} />;
        default:
            return <span className="text-xl">{fallbackIcon}</span>;
    }
};

const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-200 text-zinc-500 dark:text-zinc-400 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const HistoryItemCard: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(item.timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const renderResults = () => {
    const { seoKeywords, seoMetaDescriptions, seoSchemaMarkups } = item.results;
    const isSeoResult = seoKeywords || seoMetaDescriptions || seoSchemaMarkups;

    if (isSeoResult) {
      return (
        <div className="space-y-6">
          {seoKeywords && (
            <div>
                <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-3">Keywords</h3>
                <ResultsDisplay results={seoKeywords} />
            </div>
          )}
          {seoMetaDescriptions && (
            <div>
                <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-3">Meta Descriptions</h3>
                <MetaDescriptionDisplay results={seoMetaDescriptions} />
            </div>
          )}
          {seoSchemaMarkups && (
            <div>
                <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-3">Schema Markup</h3>
                <SchemaMarkupDisplay results={seoSchemaMarkups} />
            </div>
          )}
        </div>
      );
    }
    // Fallback for older or non-SEO history items
    return <ResultsDisplay results={item.results} />;
  };

  return (
    <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700 p-4 mb-4">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left flex justify-between items-center group">
        <div className="flex items-center">
          <div className="mr-3 text-zinc-600 dark:text-zinc-400">
            <PlatformIcon platform={item.platform} fallbackIcon={item.icon} />
          </div>
          <div>
            <p className="font-bold text-zinc-800 dark:text-zinc-200">{item.platform}</p>
            <div className="flex items-center gap-x-2">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{date}</p>
                {item.language && (
                    <>
                        <span className="text-zinc-300 dark:text-zinc-600">•</span>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.language}</p>
                    </>
                )}
            </div>
          </div>
        </div>
        <ChevronIcon isExpanded={isExpanded} />
      </button>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-amber-200 dark:border-zinc-700">
          <h4 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Original Input:</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 p-3 rounded-lg mb-4 whitespace-pre-wrap break-words">
            {item.userInput || <span className="italic">No text input provided (file-only submission).</span>}
          </p>
          {renderResults()}
        </div>
      )}
    </div>
  );
};

// Helper function to recursively serialize complex result objects for export
const serializeResultForExport = (data: any, isHtml: boolean): string => {
  if (!data) return '';
  const itemSeparator = isHtml ? '<br/>' : '\n';

  if (Array.isArray(data)) {
    return data.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null && 'keyword' in item) {
        const k = item as any;
        const details: string[] = [];
        if (k.searchVolume) details.push(`Vol: ${k.searchVolume}`);
        if (k.trendingRank) details.push(`Trend: ${k.trendingRank}/10`);
        if (k.userIntent) details.push(`Intent: ${k.userIntent}`);
        if (k.competition) details.push(`Comp: ${k.competition}`);
        if (k.cpc) details.push(`CPC: ${k.cpc}`);
        
        const metadataString = details.length > 0 ? ` [${details.join(' | ')}]` : '';
        return `${k.keyword}${metadataString}`;
      }
      return JSON.stringify(item);
    }).join(itemSeparator);
  }

  if (typeof data === 'object') {
    return Object.entries(data).map(([key, value]) => {
      const formattedKey = key;
      let serializedValue: string;

      if (typeof value === 'object' && value !== null && !Array.isArray(value) && 'schemaType' in value && 'jsonLd' in value) {
        const schema = value as { schemaType: string; jsonLd: string };
        serializedValue = `Type: ${schema.schemaType}, JSON: ${schema.jsonLd}`;
      } else {
        serializedValue = serializeResultForExport(value, isHtml);
      }
      return `${formattedKey}: ${itemSeparator}${serializedValue}`;
    }).join(itemSeparator + itemSeparator);
  }

  return String(data);
};


export const HistoryDisplay: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = useCallback(() => {
    try {
      const storedHistory = localStorage.getItem('generationHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      // Clear potentially corrupt data
      localStorage.removeItem('generationHistory');
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire generation history? This action cannot be undone.")) {
        localStorage.removeItem('generationHistory');
        loadHistory(); // Reload from storage to update the state
    }
  };

  const exportToCSV = () => {
    if (history.length === 0) return;

    const allCategoryKeys = new Set<string>();
    history.forEach(item => {
        Object.keys(item.results).forEach(key => allCategoryKeys.add(key));
    });
    const categoryHeaders = Array.from(allCategoryKeys);
    const headers = ['Timestamp', 'Platform', 'Language', 'User Input', ...categoryHeaders];

    const escapeCSV = (field: any): string => {
        const stringField = String(field || '').replace(/"/g, '""');
        return `"${stringField}"`;
    };

    const csvRows = [headers.join(',')];

    history.forEach(item => {
        const row = headers.map(header => {
            if (['Timestamp', 'Platform', 'Language', 'User Input'].includes(header)) {
                let value = (item as any)[header.toLowerCase().replace(' ', '')] ?? '';
                if (header === 'User Input' && !value) value = 'File-only submission';
                return escapeCSV(value);
            }
            return escapeCSV(serializeResultForExport(item.results[header], false));
        });
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'generation_history.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    if (history.length === 0) return;

    const allCategoryKeys = new Set<string>();
    history.forEach(item => {
        Object.keys(item.results).forEach(key => allCategoryKeys.add(key));
    });
    const categoryHeaders = Array.from(allCategoryKeys);
    const headers = ['Timestamp', 'Platform', 'Language', 'User Input', ...categoryHeaders];

    const escapeHTMLMap: { [key: string]: string } = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    const escapeHTML = (str: any) => String(str || '').replace(/[&<>"']/g, m => escapeHTMLMap[m as keyof typeof escapeHTMLMap]);

    const tableHeader = `
        <thead>
            <tr>
                ${headers.map(h => `<th>${escapeHTML(h)}</th>`).join('')}
            </tr>
        </thead>
    `;

    const tableRows = history.map(item => {
        const cells = headers.map(header => {
            let cellContent = '';
            if (['Timestamp', 'Platform', 'Language', 'User Input'].includes(header)) {
                let value = (item as any)[header.toLowerCase().replace(' ', '')] ?? '';
                 if (header === 'User Input' && !value) value = 'File-only submission';
                 cellContent = escapeHTML(value);
            } else {
                 cellContent = serializeResultForExport(item.results[header], true);
            }
            return `<td style="vertical-align: top; white-space: pre-wrap;">${cellContent}</td>`;
        }).join('');
        
        return `<tr>${cells}</tr>`;
    }).join('');

    const table = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Generation History</x:Name>
                            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
            <style>
                table, th, td {
                    border: 1px solid #ccc;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 8px;
                    text-align: left;
                    font-family: sans-serif;
                }
                th {
                    background-color: #f3f4f6;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <table>${tableHeader}<tbody>${tableRows}</tbody></table>
        </body>
        </html>
    `;
    
    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generation_history.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  if (history.length === 0) {
    return <InitialState title="No History Yet" message="Your generated content will appear here once you use the optimizer." />;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">Generation History</h3>
        <div className="flex gap-2">
            <button
                onClick={exportToCSV}
                disabled={history.length === 0}
                className="px-4 py-2 text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-zinc-700/50 rounded-lg hover:bg-amber-100 dark:hover:bg-zinc-700/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                aria-label="Export history to CSV"
            >
                <ExportIcon />
                Export CSV
            </button>
            <button
                onClick={exportToExcel}
                disabled={history.length === 0}
                className="px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-100/60 dark:bg-zinc-700/50 rounded-lg hover:bg-green-100 dark:hover:bg-zinc-700/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                aria-label="Export history to Excel"
            >
                <ExcelIcon />
                Export Excel
            </button>
            <button 
                onClick={clearHistory} 
                disabled={history.length === 0}
                className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-zinc-700/50 rounded-lg hover:bg-red-100 dark:hover:bg-zinc-700/80 transition-colors disabled:opacity-50"
                aria-label="Clear all history"
            >
            Clear History
            </button>
        </div>
      </div>
      {history.map(item => (
        <HistoryItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};
