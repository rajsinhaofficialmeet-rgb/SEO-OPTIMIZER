import React, { useState } from 'react';

interface SchemaMarkup {
  schemaType: string;
  jsonLd: string;
}

interface SchemaMarkupDisplayProps {
  results: Record<string, SchemaMarkup>;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

export const SchemaMarkupDisplay: React.FC<SchemaMarkupDisplayProps> = ({ results }) => {
    const [justCopied, setJustCopied] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setJustCopied(text);
        setTimeout(() => setJustCopied(null), 2000);
    };
    
    const formatJson = (jsonString: string) => {
        try {
            return JSON.stringify(JSON.parse(jsonString), null, 2);
        } catch (e) {
            // If the string is not valid JSON, return it as is.
            return jsonString;
        }
    }

    return (
        <div className="w-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700 p-6 space-y-6">
            {Object.keys(results).map(title => {
                const { schemaType, jsonLd } = results[title];
                const formattedJsonLd = formatJson(jsonLd);
                return (
                    <div key={title}>
                        <div className="flex items-center gap-3 mb-3">
                             <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{title}</h3>
                             <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300">
                                {schemaType}
                            </span>
                        </div>
                       
                        <div className="relative bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg">
                            <button
                                onClick={() => handleCopy(formattedJsonLd)}
                                className="absolute top-2 right-2 p-2 rounded-lg text-zinc-500 bg-white/50 dark:bg-zinc-700/50 hover:bg-white dark:hover:bg-zinc-700 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
                                aria-label="Copy schema markup"
                            >
                                {justCopied === formattedJsonLd ? <CheckIcon /> : <CopyIcon />}
                            </button>
                            <pre className="p-4 text-sm text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                                <code>
                                    {formattedJsonLd}
                                </code>
                            </pre>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};