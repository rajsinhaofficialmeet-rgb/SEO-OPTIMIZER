import React, { useState, useMemo } from 'react';
import { generateSeoKeywords, generateMetaDescription, generateSchemaMarkup, KeywordWithMetadata, generateContentBrief, ContentBrief, generateGoogleMapsKeywords } from '../services/geminiService';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner, LoadingSpinnerIcon } from '../components/LoadingSpinner';
import { InitialState } from '../components/InitialState';
import { ResultsDisplay } from '../components/KeywordDisplay';
import { MetaDescriptionDisplay } from '../components/MetaDescriptionDisplay';
import { SchemaMarkupDisplay } from '../components/SchemaMarkupDisplay';
import { ContentBriefDisplay } from '../components/ContentBriefDisplay';
import { saveToHistory } from '../hooks/useGenerator';
import { LanguageSelector } from '../components/LanguageSelector';

const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_CONTENT_LENGTH = 20000;
const MAX_COMPETITORS_LENGTH = 2000;
const MAX_ANALYSIS_LENGTH = 20000;
const MAX_TARGET_KEYWORD_LENGTH = 200;


interface SeoResults {
  keywords: Record<string, KeywordWithMetadata[]>;
  metaDescriptions: Record<string, string[]>;
  schemaMarkups: Record<string, { schemaType: string, jsonLd: string }>;
}

interface MapsResults {
  keywords: KeywordWithMetadata[];
  groundingChunks: any[];
}

const seoTabs = [
  { id: 'keywords', name: 'Keywords' },
  { id: 'meta', name: 'Meta Descriptions' },
  { id: 'schema', name: 'Schema Markup' },
];

export const SeoGenerator: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'keywords' | 'brief' | 'maps'>('keywords');
  
  // State for Keyword Research tool
  const [inputMode, setInputMode] = useState<'description' | 'content'>('description');
  const [contentInput, setContentInput] = useState('');
  const [analysisText, setAnalysisText] = useState<string>('');
  const [keywordResults, setKeywordResults] = useState<SeoResults | null>(null);
  
  // State for Content Brief tool
  const [targetKeyword, setTargetKeyword] = useState('');
  const [briefResult, setBriefResult] = useState<ContentBrief | null>(null);

  // State for Maps SEO tool
  const [mapsResults, setMapsResults] = useState<MapsResults | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Shared State
  const [descriptionInput, setDescriptionInput] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('English');
  const [activeTab, setActiveTab] = useState('keywords');
  
  const platformInfo = { platformName: 'Website SEO', platformIcon: '🌐' };

  // --- Validation Logic ---
  const isDescriptionTooLong = descriptionInput.length > MAX_DESCRIPTION_LENGTH;
  const isContentTooLong = contentInput.length > MAX_CONTENT_LENGTH;
  const isCompetitorsTooLong = competitors.length > MAX_COMPETITORS_LENGTH;
  const isAnalysisTooLong = analysisText.length > MAX_ANALYSIS_LENGTH;
  const isTargetKeywordTooLong = targetKeyword.length > MAX_TARGET_KEYWORD_LENGTH;

  const keywordToolError = useMemo(() => {
    if (inputMode === 'description' && isDescriptionTooLong) return `Input cannot exceed ${MAX_DESCRIPTION_LENGTH.toLocaleString()} characters.`;
    if (inputMode === 'content' && isContentTooLong) return `Content cannot exceed ${MAX_CONTENT_LENGTH.toLocaleString()} characters.`;
    if (isCompetitorsTooLong) return `Competitors list cannot exceed ${MAX_COMPETITORS_LENGTH.toLocaleString()} characters.`;
    return null;
  }, [inputMode, descriptionInput, contentInput, competitors, isDescriptionTooLong, isContentTooLong, isCompetitorsTooLong]);

  const briefToolError = useMemo(() => {
      if (isTargetKeywordTooLong) return `Target keyword cannot exceed ${MAX_TARGET_KEYWORD_LENGTH.toLocaleString()} characters.`;
      if (isCompetitorsTooLong) return `Competitors list cannot exceed ${MAX_COMPETITORS_LENGTH.toLocaleString()} characters.`;
      return null;
  }, [targetKeyword, competitors, isTargetKeywordTooLong, isCompetitorsTooLong]);

  const mapsToolError = useMemo(() => {
    if (isDescriptionTooLong) return `Input cannot exceed ${MAX_DESCRIPTION_LENGTH.toLocaleString()} characters.`;
    if (isCompetitorsTooLong) return `Competitors list cannot exceed ${MAX_COMPETITORS_LENGTH.toLocaleString()} characters.`;
    return null;
  }, [descriptionInput, competitors, isDescriptionTooLong, isCompetitorsTooLong]);

  const isKeywordToolSubmittable = useMemo(() => {
    if (isCompetitorsTooLong) return false;
    if (inputMode === 'description') return !!descriptionInput.trim() && !isDescriptionTooLong;
    return !!contentInput.trim() && !isContentTooLong;
  }, [inputMode, descriptionInput, contentInput, competitors, isDescriptionTooLong, isContentTooLong, isCompetitorsTooLong]);

  const isBriefToolSubmittable = useMemo(() => {
      return !!targetKeyword.trim() && !isTargetKeywordTooLong && !isCompetitorsTooLong;
  }, [targetKeyword, competitors, isTargetKeywordTooLong, isCompetitorsTooLong]);

  const isMapsToolSubmittable = useMemo(() => {
    return !!descriptionInput.trim() && !isDescriptionTooLong && !!location && !isCompetitorsTooLong;
  }, [descriptionInput, location, competitors, isDescriptionTooLong, isCompetitorsTooLong]);


  // --- Generation Logic ---
  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setKeywordResults(null);
    setBriefResult(null);
    setMapsResults(null);
    setAnalysisText('');
    
    if (activeTool === 'keywords') {
      await generateKeywords();
    } else if (activeTool === 'brief') {
      await generateBrief();
    } else if (activeTool === 'maps') {
      await generateMapsKeywords();
    }
    
    setIsLoading(false);
  };

  const generateKeywords = async () => {
    if (!isKeywordToolSubmittable) {
        setIsLoading(false);
        return;
    }
    setActiveTab('keywords');
    try {
      if (inputMode === 'description') {
        const inputs = descriptionInput.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (inputs.length === 0) return;

        const generationPromises = inputs.map(input => Promise.all([
          generateSeoKeywords(input, language, 'description', competitors),
          generateMetaDescription(input, language, 'description', competitors),
          generateSchemaMarkup(input, language, 'description', competitors),
        ]));
        const responses = await Promise.all(generationPromises);
        const combinedResults: SeoResults = { keywords: {}, metaDescriptions: {}, schemaMarkups: {} };
        responses.forEach((responseGroup, index) => {
          const inputKey = inputs[index];
          const [keywordRes, metaRes, schemaRes] = responseGroup;
          combinedResults.keywords[`Keywords for "${inputKey}"`] = keywordRes.keywords;
          combinedResults.metaDescriptions[`Meta Descriptions for "${inputKey}"`] = metaRes.metaDescriptions;
          combinedResults.schemaMarkups[`Schema Markup for "${inputKey}"`] = { schemaType: schemaRes.schemaType, jsonLd: schemaRes.jsonLd };
        });
        setKeywordResults(combinedResults);
        saveToHistory({
            platform: platformInfo.platformName, icon: platformInfo.platformIcon, userInput: descriptionInput,
            results: { seoKeywords: combinedResults.keywords, seoMetaDescriptions: combinedResults.metaDescriptions, seoSchemaMarkups: combinedResults.schemaMarkups },
            language: language,
        });
      } else {
        const [keywordRes, metaRes, schemaRes] = await Promise.all([
          generateSeoKeywords(contentInput, language, 'content', competitors),
          generateMetaDescription(contentInput, language, 'content', competitors),
          generateSchemaMarkup(contentInput, language, 'content', competitors),
        ]);
        const combinedResults: SeoResults = {
            keywords: { [`Keywords for Analyzed Content`]: keywordRes.keywords },
            metaDescriptions: { [`Meta Descriptions for Analyzed Content`]: metaRes.metaDescriptions },
            schemaMarkups: { [`Schema Markup for Analyzed Content`]: { schemaType: schemaRes.schemaType, jsonLd: schemaRes.jsonLd } }
        };
        setKeywordResults(combinedResults);
        saveToHistory({
            platform: platformInfo.platformName, icon: platformInfo.platformIcon, userInput: `[Content Analysis]\n${contentInput.substring(0, 500)}...`,
            results: { seoKeywords: combinedResults.keywords, seoMetaDescriptions: combinedResults.metaDescriptions, seoSchemaMarkups: combinedResults.schemaMarkups },
            language: language,
        });
      }
    } catch (err) {
      handleError(err);
    }
  };

  const generateBrief = async () => {
      if (!isBriefToolSubmittable) {
        setIsLoading(false);
        return;
      }
      try {
          const result = await generateContentBrief(targetKeyword, language, competitors);
          setBriefResult(result);
          saveToHistory({
              platform: 'Content Brief',
              icon: '📝',
              userInput: `Target Keyword: ${targetKeyword}${competitors ? `\nCompetitors: ${competitors}` : ''}`,
              results: { contentBrief: result },
              language: language,
          });
      } catch(err) {
          handleError(err);
      }
  };

  const generateMapsKeywords = async () => {
    if (!isMapsToolSubmittable) {
      setIsLoading(false);
      return;
    }
    try {
      const result = await generateGoogleMapsKeywords(descriptionInput, language, location!, competitors);
      setMapsResults(result);
      saveToHistory({
        platform: 'Google Maps SEO',
        icon: '📍',
        userInput: `Business: ${descriptionInput}\nLocation: ${location!.latitude.toFixed(4)}, ${location!.longitude.toFixed(4)}`,
        results: { 'Google Maps Keywords': result.keywords },
        language: language,
      });
    } catch (err) {
      handleError(err);
    }
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser.");
        return;
    }
    setIsFetchingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
            setIsFetchingLocation(false);
        },
        () => {
            setLocationError("Unable to retrieve your location. Please grant permission and try again.");
            setIsFetchingLocation(false);
        }
    );
  };

  const handleError = (err: any) => {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    setError(`Failed to generate content. ${errorMessage} Please try again in a moment.`);
  }
  
  const resultsWithDensity = useMemo(() => {
    if (!analysisText.trim() || !keywordResults || isAnalysisTooLong) return keywordResults?.keywords;
    const words = analysisText.split(/\s+/).filter(Boolean);
    const totalWords = words.length;
    if (totalWords === 0) return keywordResults.keywords;
    
    const newKeywords: Record<string, KeywordWithMetadata[]> = {};
    for (const key in keywordResults.keywords) {
        newKeywords[key] = keywordResults.keywords[key].map(kw => {
            const escapedKeyword = kw.keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
            const matches = analysisText.match(regex);
            const count = matches ? matches.length : 0;
            const density = (count / totalWords) * 100;
            return { ...kw, density };
        });
    }
    return newKeywords;
  }, [analysisText, keywordResults, isAnalysisTooLong]);

  const numInputs = descriptionInput.split('\n').map(line => line.trim()).filter(line => line.length > 0).length;

  const getSpinnerMessage = () => {
    const competitivePart = competitors.trim() ? "Running competitive analysis and " : "";
    if (activeTool === 'brief') {
        return `Analyzing SERP for "${targetKeyword}" and generating content brief...`;
    }
    if (activeTool === 'maps') {
      return `Analyzing local data for "${descriptionInput.split('\n')[0]}" and generating Maps keywords...`;
    }
    const actionPart = inputMode === 'description' ? `generating assets for ${numInputs} item(s)...` : 'analyzing content and generating assets...';
    return competitivePart + actionPart;
  };

  const renderKeywordToolResults = () => {
    if (!keywordResults) return null;
    switch (activeTab) {
      case 'keywords':
        return (
          <>
            <div className="mb-6 w-full p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Keyword Density Analysis</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-3">Paste your content here to see how often your generated keywords appear.</p>
              <textarea
                value={analysisText} onChange={(e) => setAnalysisText(e.target.value)}
                placeholder="Paste your blog post, article, or page content here..."
                className="w-full h-48 p-3 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 resize-y"
                aria-label="Content for keyword density analysis"
              />
               <div className="mt-1 flex justify-between items-center text-xs">
                {isAnalysisTooLong ? <p className="text-red-600 dark:text-red-400 font-semibold"> Analysis text is too long. </p> : <div />}
                <p className={`text-zinc-500 dark:text-zinc-400 ${isAnalysisTooLong ? 'font-bold text-red-600 dark:text-red-400' : ''}`}>
                  {analysisText.length.toLocaleString()}/{MAX_ANALYSIS_LENGTH.toLocaleString()}
                </p>
              </div>
            </div>
            <ResultsDisplay results={resultsWithDensity || keywordResults.keywords} />
          </>
        );
      case 'meta': return <MetaDescriptionDisplay results={keywordResults.metaDescriptions} />;
      case 'schema': return <SchemaMarkupDisplay results={keywordResults.schemaMarkups} />;
      default: return null;
    }
  };

  const renderKeywordToolInputs = () => (
      <>
        <div className="mb-6 flex justify-center flex-wrap gap-2 border-b border-amber-200 dark:border-zinc-700">
            <button onClick={() => setInputMode('description')} className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-200 focus:outline-none -mb-px border-b-2 ${inputMode === 'description' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
              By Description or URL
            </button>
            <button onClick={() => setInputMode('content')} className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-200 focus:outline-none -mb-px border-b-2 ${inputMode === 'content' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
              By Page Content
            </button>
        </div>
        <div className="w-full p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700 space-y-4">
          {inputMode === 'description' ? (
              <div>
                  <label htmlFor="description-input" className="block text-lg font-semibold text-zinc-700 dark:text-zinc-300">Enter Websites, Business Names, or Details (one per line)</label>
                  <textarea id="description-input" value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} placeholder="my-store.com&#10;A local coffee shop in Brooklyn&#10;Handmade leather wallets for minimalists" className="mt-3 w-full p-3 h-32 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 resize-none" disabled={isLoading} />
                  <div className="mt-1 flex justify-end items-center text-xs"><p className={`text-zinc-500 dark:text-zinc-400 ${isDescriptionTooLong ? 'font-bold text-red-600 dark:text-red-400' : ''}`}>{descriptionInput.length.toLocaleString()}/{MAX_DESCRIPTION_LENGTH.toLocaleString()}</p></div>
              </div>
          ) : (
              <div>
                  <div className="p-4 mb-4 text-sm text-center text-zinc-600 dark:text-zinc-400 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg"><p className="font-semibold">For the most accurate analysis, paste your webpage's text here.</p><p className="text-xs mt-1">Due to browser security policies, we cannot automatically fetch content from URLs. This manual step ensures the best results.</p></div>
                  <label htmlFor="content-input" className="block text-lg font-semibold text-zinc-700 dark:text-zinc-300">Analyze Website Content</label>
                  <textarea id="content-input" value={contentInput} onChange={(e) => setContentInput(e.target.value)} placeholder="Paste the full text content of your webpage here for a detailed analysis..." className="mt-3 w-full p-3 h-64 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 resize-none" disabled={isLoading} />
                   <div className="mt-1 flex justify-end items-center text-xs"><p className={`text-zinc-500 dark:text-zinc-400 ${isContentTooLong ? 'font-bold text-red-600 dark:text-red-400' : ''}`}>{contentInput.length.toLocaleString()}/{MAX_CONTENT_LENGTH.toLocaleString()}</p></div>
              </div>
          )}
        </div>
      </>
  );

  const renderBriefToolInputs = () => (
      <div className="w-full p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700 space-y-4">
        <div>
          <label htmlFor="target-keyword-input" className="block text-lg font-semibold text-zinc-700 dark:text-zinc-300">Enter Your Primary Target Keyword</label>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">The AI will analyze the top search results for this keyword to build your content plan.</p>
          <input id="target-keyword-input" type="text" value={targetKeyword} onChange={(e) => setTargetKeyword(e.target.value)} placeholder="e.g., how to make sourdough bread" className="mt-3 w-full p-3 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200" disabled={isLoading} />
          <div className="mt-1 flex justify-end items-center text-xs"><p className={`text-zinc-500 dark:text-zinc-400 ${isTargetKeywordTooLong ? 'font-bold text-red-600 dark:text-red-400' : ''}`}>{targetKeyword.length.toLocaleString()}/{MAX_TARGET_KEYWORD_LENGTH.toLocaleString()}</p></div>
        </div>
      </div>
  );

  const renderMapsToolInputs = () => (
    <div className="w-full p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700 space-y-4">
      <div>
        <label htmlFor="description-input-maps" className="block text-lg font-semibold text-zinc-700 dark:text-zinc-300">Enter Business Name or Description</label>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Provide details about the local business you want to optimize for.</p>
        <textarea id="description-input-maps" value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} placeholder="e.g., Joe's Pizza, a family-owned pizzeria in downtown Springfield" className="mt-3 w-full p-3 h-24 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 resize-none" disabled={isLoading} />
        <div className="mt-1 flex justify-end items-center text-xs"><p className={`text-zinc-500 dark:text-zinc-400 ${isDescriptionTooLong ? 'font-bold text-red-600 dark:text-red-400' : ''}`}>{descriptionInput.length.toLocaleString()}/{MAX_DESCRIPTION_LENGTH.toLocaleString()}</p></div>
      </div>
      <div>
        <label className="block text-lg font-semibold text-zinc-700 dark:text-zinc-300">Location</label>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your location is required for accurate local keyword generation.</p>
        <div className="mt-3">
          {location ? (
            <div className="p-3 text-center bg-green-100/50 dark:bg-green-900/30 rounded-lg text-green-800 dark:text-green-300 font-semibold">
              Location Acquired: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          ) : (
            <button onClick={handleGetLocation} disabled={isFetchingLocation} className="w-full flex items-center justify-center px-6 py-3 font-semibold text-amber-700 dark:text-amber-300 bg-amber-200/50 dark:bg-zinc-700 rounded-lg hover:bg-amber-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-wait transition-colors">
              {isFetchingLocation ? <><LoadingSpinnerIcon /> Fetching...</> : 'Get My Location'}
            </button>
          )}
          {locationError && <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{locationError}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex justify-center flex-wrap gap-2 border-b border-amber-200 dark:border-zinc-700">
          <button onClick={() => setActiveTool('keywords')} className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-200 focus:outline-none -mb-px border-b-2 ${activeTool === 'keywords' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
            Keyword Research
          </button>
          <button onClick={() => setActiveTool('brief')} className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-200 focus:outline-none -mb-px border-b-2 ${activeTool === 'brief' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
            Content Brief
          </button>
          <button onClick={() => setActiveTool('maps')} className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-200 focus:outline-none -mb-px border-b-2 ${activeTool === 'maps' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
            Google Maps SEO
          </button>
      </div>
      
      {activeTool === 'keywords' && renderKeywordToolInputs()}
      {activeTool === 'brief' && renderBriefToolInputs()}
      {activeTool === 'maps' && renderMapsToolInputs()}


      {/* Shared Inputs */}
      <div className="mt-6 w-full p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700 space-y-4">
        <div className="pt-0">
          <label htmlFor="competitor-input" className="block text-lg font-semibold text-zinc-700 dark:text-zinc-300">Competitors (Optional)</label>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Add competitor websites or descriptions (one per line) for a <span className="font-bold text-amber-600 dark:text-amber-400">more accurate, strategic analysis.</span></p>
          <textarea id="competitor-input" value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="competitor-a.com&#10;Another coffee shop in the city&#10;Mass-produced wallet store" className="mt-3 w-full p-3 h-24 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 resize-none" disabled={isLoading} />
          <div className="mt-1 flex justify-end items-center text-xs"><p className={`text-zinc-500 dark:text-zinc-400 ${isCompetitorsTooLong ? 'font-bold text-red-600 dark:text-red-400' : ''}`}>{competitors.length.toLocaleString()}/{MAX_COMPETITORS_LENGTH.toLocaleString()}</p></div>
        </div>
        <LanguageSelector language={language} setLanguage={setLanguage} disabled={isLoading} />
        {(activeTool === 'keywords' && keywordToolError) && <p className="text-red-600 dark:text-red-400 font-semibold text-center text-sm">{keywordToolError}</p>}
        {(activeTool === 'brief' && briefToolError) && <p className="text-red-600 dark:text-red-400 font-semibold text-center text-sm">{briefToolError}</p>}
        {(activeTool === 'maps' && mapsToolError) && <p className="text-red-600 dark:text-red-400 font-semibold text-center text-sm">{mapsToolError}</p>}
        <div className="mt-4 flex justify-end items-center">
            <button onClick={handleGenerate} disabled={isLoading || (activeTool === 'keywords' ? !isKeywordToolSubmittable : (activeTool === 'brief' ? !isBriefToolSubmittable : !isMapsToolSubmittable))} className="w-full sm:w-auto flex items-center justify-center px-6 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg disabled:shadow-none">
                {isLoading ? <><LoadingSpinnerIcon />Generating...</> : 'Generate'}
            </button>
        </div>
      </div>
      
      {error && <ErrorMessage message={error} />}

      <div className="mt-8 min-h-[300px]">
        {isLoading && <LoadingSpinner message={getSpinnerMessage()} />}
        
        {!isLoading && activeTool === 'keywords' && keywordResults && (
          <div className="animate-fade-in-subtle">
            <div className="mb-6 flex justify-center flex-wrap gap-2 border-b border-amber-200 dark:border-zinc-700">
              {seoTabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-200 focus:outline-none -mb-px border-b-2 ${activeTab === tab.id ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`} aria-pressed={activeTab === tab.id}>
                  {tab.name}
                </button>
              ))}
            </div>
            {renderKeywordToolResults()}
          </div>
        )}
        
        {!isLoading && activeTool === 'brief' && briefResult && (
            <ContentBriefDisplay brief={briefResult} targetKeyword={targetKeyword} />
        )}
        
        {!isLoading && activeTool === 'maps' && mapsResults && (
           <ResultsDisplay results={{ 'Google Maps Keywords': mapsResults.keywords }} groundingSources={mapsResults.groundingChunks} />
        )}


        {!isLoading && !keywordResults && !briefResult && !mapsResults && !error && (
            activeTool === 'keywords' ? (
                <InitialState title="Ready to Boost Your SEO?" message="Your generated keywords, meta descriptions, and schema markup will appear here. Enter details above to get started." />
            ) : activeTool === 'brief' ? (
                <InitialState title="Generate a Content Brief" message="Enter a target keyword to get a complete content strategy based on an analysis of top search results."/>
            ) : (
                <InitialState title="Optimize for Local Search" message="Enter your business details and provide your location to generate keywords tailored for Google Maps." />
            )
        )}
      </div>
    </div>
  );
};