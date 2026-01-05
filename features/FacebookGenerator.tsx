import React, { useState, useCallback } from 'react';
import { useGenerator } from '../hooks/useGenerator';
import { generateFacebookContent } from '../services/geminiService';
import { InputForm } from '../components/InputForm';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { InitialState } from '../components/InitialState';
import { ResultsDisplay } from '../components/KeywordDisplay';
import { FileUpload } from '../components/FileUpload';
import { LanguageSelector } from '../components/LanguageSelector';

const MAX_INPUT_LENGTH = 5000;

export const FacebookGenerator: React.FC = () => {
  const [fileData, setFileData] = useState<{ mimeType: string; data: string; } | null>(null);
  const [language, setLanguage] = useState('English');

  const generatorFn = useCallback((postInfo: string) => {
    return generateFacebookContent({ postInfo, fileData, language });
  }, [fileData, language]);

  const { userInput, setUserInput, results, isLoading, error, handleGenerate } = useGenerator(
    generatorFn,
    { platformName: 'Facebook', platformIcon: '👍' }
  );

  const isInputTooLong = userInput.length > MAX_INPUT_LENGTH;
  const inputError = isInputTooLong ? `Input cannot exceed ${MAX_INPUT_LENGTH.toLocaleString()} characters.` : null;
  const isSubmittable = !isInputTooLong && (!!userInput.trim() || !!fileData);

  const handleFileSelect = (data: { mimeType: string; data: string } | null) => {
    setFileData(data);
  };

  const labelText = fileData ? "Describe your uploaded media for better context" : "Describe your Facebook Post";
  const placeholderText = fileData
    ? "e.g., A photo of our team celebrating a recent product launch in the office."
    : "e.g., 'Check out our new summer collection! Perfect for sunny days and beach trips.'";

  const handleSubmit = () => {
    if (!isSubmittable) return;
    handleGenerate({ language });
  };
  
  const platformInfo = {
    platform: 'Facebook',
    icon: '👍',
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
        <LanguageSelector language={language} setLanguage={setLanguage} disabled={isLoading} />
        <FileUpload
          onFileSelect={handleFileSelect}
          disabled={isLoading}
          acceptedFileTypes="image/*,video/*"
          label="Attach an Image or Video (Optional)"
        />
      </InputForm>
      
      {error && <ErrorMessage message={error} />}

      <div className="mt-8 min-h-[300px]">
        {isLoading && <LoadingSpinner message="Generating Facebook content..." />}
        {results && <ResultsDisplay results={results} platformInfo={platformInfo} />}
        {!isLoading && !results && !error && (
          <InitialState
            title="Supercharge Your Facebook Page"
            message="Describe your post or upload an image to generate engaging text, relevant hashtags, and calls to action."
          />
        )}
      </div>
    </div>
  );
};
