import React, { useState, useCallback } from 'react';
import { useGenerator } from '../hooks/useGenerator';
import { generateYouTubeContent } from '../services/geminiService';
import { InputForm } from '../components/InputForm';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { InitialState } from '../components/InitialState';
import { ResultsDisplay } from '../components/KeywordDisplay';
import { FileUpload } from '../components/FileUpload';
import { LanguageSelector } from '../components/LanguageSelector';

const youtubeCategories = [
  "Film & Animation",
  "Autos & Vehicles",
  "Music",
  "Pets & Animals",
  "Sports",
  "Travel & Events",
  "Gaming",
  "People & Blogs",
  "Comedy",
  "Entertainment",
  "News & Politics",
  "Howto & Style",
  "Education",
  "Science & Technology",
  "Nonprofits & Activism",
];

const MAX_INPUT_LENGTH = 5000;

export const YouTubeGenerator: React.FC = () => {
  const [category, setCategory] = useState('');
  const [fileData, setFileData] = useState<{ mimeType: string; data: string; } | null>(null);
  const [language, setLanguage] = useState('English');

  const generatorFn = useCallback((videoInfo: string) => {
    return generateYouTubeContent({ videoInfo, category, fileData, language });
  }, [category, fileData, language]);

  const { userInput, setUserInput, results, isLoading, error, handleGenerate } = useGenerator(
    generatorFn,
    { platformName: 'YouTube', platformIcon: '📺' }
  );

  const isInputTooLong = userInput.length > MAX_INPUT_LENGTH;
  const inputError = isInputTooLong ? `Input cannot exceed ${MAX_INPUT_LENGTH.toLocaleString()} characters.` : null;
  const isSubmittable = !isInputTooLong && (!!userInput.trim() || !!fileData);

  const handleFileSelect = (data: { mimeType: string; data: string } | null) => {
    setFileData(data);
  };
  
  const labelText = fileData ? "Describe your uploaded media for better context" : "Describe your YouTube Video";
  const placeholderText = fileData
    ? "e.g., A cinematic drone shot of a coastline at sunrise. The video shows waves crashing against cliffs."
    : "e.g., 'A tutorial on how to bake sourdough bread from scratch for beginners'";
    
  const handleSubmit = () => {
    if (!isSubmittable) return;
    handleGenerate({ language });
  };
  
  const platformInfo = {
    platform: 'YouTube',
    icon: '📺',
    userInput,
    language
  };

  return (
    <div>
      <InputForm
        userInput={userInput}
        setUserInput={setUserInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder={placeholderText}
        label={labelText}
        isSubmittable={isSubmittable}
        maxLength={MAX_INPUT_LENGTH}
        inputError={inputError}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
              <label htmlFor="category-input" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Video Category (Optional)
              </label>
              <select
                  id="category-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full p-2 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
                  disabled={isLoading}
                  aria-label="Video Category (Optional)"
              >
                <option value="">Select a category...</option>
                {youtubeCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
          </div>
          <div className="mt-4 sm:mt-0">
            <LanguageSelector language={language} setLanguage={setLanguage} disabled={isLoading} />
          </div>
        </div>
        <FileUpload
          onFileSelect={handleFileSelect}
          disabled={isLoading}
          acceptedFileTypes="image/*,video/*,application/pdf"
          label="Attach an Image, Video, or PDF (Optional)"
        />
      </InputForm>
      
      {error && <ErrorMessage message={error} />}

      <div className="mt-8 min-h-[300px]">
        {isLoading && <LoadingSpinner message="Generating YouTube content..." />}
        {results && <ResultsDisplay results={results} platformInfo={platformInfo} />}
        {!isLoading && !results && !error && (
          <InitialState
            title="Optimize Your YouTube Video"
            message="Get SEO-friendly tags, description keywords, and title ideas. Describe your video above to start."
          />
        )}
      </div>
    </div>
  );
};
