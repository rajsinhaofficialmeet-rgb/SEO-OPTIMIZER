import React, { useState, useRef } from 'react';
import type { ContentBrief } from '../services/geminiService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ContentBriefDisplayProps {
  brief: ContentBrief;
  targetKeyword: string;
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


const InfoCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-amber-100/30 dark:bg-zinc-900/50 p-4 rounded-lg ${className}`}>
    <h4 className="font-semibold text-zinc-600 dark:text-zinc-400">{title}</h4>
    <div className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{children}</div>
  </div>
);

export const ContentBriefDisplay: React.FC<ContentBriefDisplayProps> = ({ brief, targetKeyword }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const briefContainerRef = useRef<HTMLDivElement>(null);

  const generateMarkdownBrief = () => {
    let markdown = `# Content Brief: ${targetKeyword}\n\n`;
    markdown += `## 1. Core SEO Elements\n`;
    markdown += `- **Search Intent:** ${brief.searchIntent}\n`;
    markdown += `- **Suggested Title:** ${brief.suggestedTitle}\n`;
    markdown += `- **Meta Description:** ${brief.metaDescription}\n`;
    markdown += `- **Target Word Count:** ${brief.targetWordCount}\n\n`;

    markdown += `## 2. SERP & Competitor Analysis\n`;
    markdown += `${brief.serpAnalysis}\n\n`;

    markdown += `## 3. Key Topics & Concepts\n`;
    brief.keyTopics.forEach(topic => {
      markdown += `- ${topic}\n`;
    });
    markdown += `\n`;

    markdown += `## 4. Questions to Answer\n`;
    brief.questionsToAnswer.forEach(question => {
      markdown += `- ${question}\n`;
    });
    markdown += `\n`;

    markdown += `## 5. Suggested Content Outline\n`;
    brief.suggestedOutline.forEach(h2 => {
      markdown += `### ${h2.heading}\n`;
      h2.children.forEach(h3 => {
        markdown += `- ${h3.heading}\n`;
      });
      markdown += `\n`;
    });

    markdown += `## 6. Linking Strategy\n`;
    markdown += `${brief.linkingSuggestions}\n`;

    return markdown;
  };

  const handleCopy = () => {
    const markdown = generateMarkdownBrief();
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownloadPdf = async () => {
    if (!briefContainerRef.current) return;
    
    setIsDownloading(true);
    
    const exportContainer = document.createElement('div');
    const isDark = document.documentElement.classList.contains('dark');
    
    // Base styles for the off-screen container
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = '0';
    exportContainer.style.width = '800px'; // A fixed width often produces better PDF layouts
    exportContainer.style.padding = '40px';
    exportContainer.style.backgroundColor = isDark ? '#18181b' : '#ffffff'; // zinc-900 or white
    exportContainer.style.color = isDark ? '#e4e4e7' : '#27272a'; // zinc-200 or zinc-800
    exportContainer.style.fontFamily = 'sans-serif';

    // Create the custom header
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '32px';

    const companyName = document.createElement('h1');
    companyName.innerText = 'Mentors Eduserv';
    companyName.style.color = '#f97316'; // orange-500
    companyName.style.fontWeight = 'bold';
    companyName.style.fontSize = '36px';

    const keywordTitle = document.createElement('h2');
    keywordTitle.innerText = `Content Brief for: "${targetKeyword}"`;
    keywordTitle.style.fontSize = '20px';
    keywordTitle.style.marginTop = '8px';
    keywordTitle.style.color = isDark ? '#a1a1aa' : '#52525b'; // zinc-400 or zinc-600

    header.appendChild(companyName);
    header.appendChild(keywordTitle);

    // Clone the results content to avoid visual glitches on the main page
    const contentClone = briefContainerRef.current.cloneNode(true) as HTMLElement;
    
    // Clean up clone's styles for a consistent PDF look
    contentClone.style.background = 'transparent';
    contentClone.style.border = 'none';
    contentClone.style.boxShadow = 'none';
    contentClone.style.backdropFilter = 'none';
    (contentClone.style as any).webkitBackdropFilter = 'none';

    // Assemble the export container
    exportContainer.appendChild(header);
    exportContainer.appendChild(contentClone);

    document.body.appendChild(exportContainer);

    try {
        const canvas = await html2canvas(exportContainer, {
            useCORS: true,
            scale: 2, // Increase resolution for better quality
        });

        const imgData = canvas.toDataURL('image/png');
        // Use pixel dimensions for jsPDF to match canvas
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height],
            hotfixes: ['px_scaling'],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`content-brief-${targetKeyword.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
        console.error('Failed to download PDF:', err);
    } finally {
        document.body.removeChild(exportContainer);
        setIsDownloading(false);
    }
  };

  return (
    <div className="w-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700 p-6 animate-fade-in-subtle">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b border-amber-200 dark:border-zinc-700 pb-6">
        <div>
          <h2 className="text-sm text-zinc-500 dark:text-zinc-400">Content Brief for</h2>
          <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">"{targetKeyword}"</h3>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0 self-start">
             <button
              onClick={handleCopy}
              className="px-4 py-2 text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-zinc-700 rounded-lg hover:bg-amber-100 dark:hover:bg-zinc-600 transition-colors duration-200 flex items-center gap-1.5"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? 'Copied!' : 'Copy Brief'}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-2 text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-zinc-700 rounded-lg hover:bg-amber-100 dark:hover:bg-zinc-600 transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
              aria-label="Download as PDF"
            >
              {isDownloading ? <LoadingSpinnerIconSmall /> : <PdfIcon />}
              <span>{isDownloading ? 'Saving...' : 'PDF'}</span>
            </button>
        </div>
      </div>
      
      <div ref={briefContainerRef} className="space-y-6">
        {/* Section 1: Core SEO */}
        <div>
            <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-3">Core SEO Elements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard title="Search Intent">{brief.searchIntent}</InfoCard>
                <InfoCard title="Target Word Count">{brief.targetWordCount}</InfoCard>
            </div>
            <div className="mt-4 space-y-3">
                <div className="bg-amber-100/30 dark:bg-zinc-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-zinc-600 dark:text-zinc-400 text-sm">Suggested Title</h4>
                    <p className="text-zinc-800 dark:text-zinc-200">{brief.suggestedTitle}</p>
                </div>
                 <div className="bg-amber-100/30 dark:bg-zinc-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-zinc-600 dark:text-zinc-400 text-sm">Meta Description</h4>
                    <p className="text-zinc-800 dark:text-zinc-200">{brief.metaDescription}</p>
                </div>
            </div>
        </div>

        {/* Section 2: SERP Analysis */}
        <div>
            <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-3">SERP Analysis</h3>
            <p className="text-zinc-600 dark:text-zinc-400 bg-amber-100/30 dark:bg-zinc-900/50 p-4 rounded-lg">{brief.serpAnalysis}</p>
        </div>

        {/* Section 3 & 4: Topics & Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-3">Key Topics to Cover</h3>
                <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300">
                    {brief.keyTopics.map((topic, index) => <li key={index}>{topic}</li>)}
                </ul>
            </div>
             <div>
                <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-3">Questions to Answer</h3>
                 <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300">
                    {brief.questionsToAnswer.map((q, index) => <li key={index}>{q}</li>)}
                </ul>
            </div>
        </div>

        {/* Section 5: Outline */}
        <div>
            <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-3">Suggested Outline</h3>
            <div className="space-y-4 p-4 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg">
                {brief.suggestedOutline.map((h2, h2Index) => (
                    <div key={h2Index}>
                        <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{h2.heading}</h4>
                        <ul className="list-disc list-inside pl-4 mt-2 space-y-1 text-zinc-700 dark:text-zinc-300">
                            {h2.children.map((h3, h3Index) => <li key={h3Index}>{h3.heading}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </div>

        {/* Section 6: Linking */}
         <div>
            <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-3">Linking Suggestions</h3>
            <p className="text-zinc-600 dark:text-zinc-400">{brief.linkingSuggestions}</p>
        </div>
      </div>
    </div>
  );
};