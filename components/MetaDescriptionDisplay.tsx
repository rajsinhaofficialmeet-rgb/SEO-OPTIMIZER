import React, { useState } from 'react';

interface MetaDescriptionDisplayProps {
  results: Record<string, string[]>;
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

export const MetaDescriptionDisplay: React.FC<MetaDescriptionDisplayProps> = ({ results }) => {
    const [justCopied, setJustCopied] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setJustCopied(text);
        setTimeout(() => setJustCopied(null), 2000);
    };

    return (
        <div className="w-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700 p-6 space-y-6">
            {Object.keys(results).map(title => (
                <div key={title}>
                    <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-3">{title}</h3>
                    <div className="space-y-3">
                        {results[title].map((description, index) => {
                            const isTooLong = description.length > 160;
                            return (
                                <div key={index} className="flex items-start gap-3 p-3 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg">
                                    <p className="flex-grow text-zinc-700 dark:text-zinc-300">
                                        {description}
                                    </p>
                                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                         <span className={`text-xs font-semibold ${isTooLong ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                            {description.length} / 160
                                        </span>
                                        <button 
                                            onClick={() => handleCopy(description)}
                                            className="p-1.5 rounded-full text-zinc-500 hover:bg-amber-200 dark:hover:bg-zinc-700 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
                                            aria-label="Copy description"
                                        >
                                            {justCopied === description ? <CheckIcon /> : <CopyIcon />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};