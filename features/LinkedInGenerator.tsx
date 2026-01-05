import React, { useState, useCallback } from 'react';
import { useGenerator } from '../hooks/useGenerator';
import { generateLinkedInHashtags } from '../services/geminiService';
import { InputForm } from '../components/InputForm';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { InitialState } from '../components/InitialState';
import { ResultsDisplay } from '../components/KeywordDisplay';
import { FileUpload } from '../components/FileUpload';
import { LanguageSelector } from '../components/LanguageSelector';

const MAX_INPUT_LENGTH = 5000;

export const LinkedInGenerator: React.FC = () => {
  const [fileData, setFileData] = useState<{ mimeType: string; data: string; } | null>(null);
  const [language, setLanguage] = useState('English');

  const generatorFn = useCallback((postInfo: string) => {
    return generateLinkedInHashtags({ postInfo, fileData, language });
  }, [fileData, language]);

  const { userInput, setUserInput, results, isLoading, error, handleGenerate } = useGenerator(
    generatorFn,
    { platformName: 'LinkedIn', platformIcon: '💼' }
  );
  
  const isInputTooLong = userInput.length > MAX_INPUT_LENGTH;
  const inputError = isInputTooLong ? `Input cannot exceed ${MAX_INPUT_LENGTH.toLocaleString()} characters.` : null;
  const isSubmittable = !isInputTooLong && (!!userInput.trim() || !!fileData);

  const handleFileSelect = (data: { mimeType: string; data: string } | null) => {
    setFileData(data);
  };

  const labelText = fileData ? "Describe your uploaded image for better context" : "Enter your LinkedIn Post Content";
  const placeholderText = fileData
    ? "e.g., A photo of our team collaborating on the new project dashboard."
    : "e.g., 'Excited to announce our new product launch that will revolutionize the tech industry...'";

  const handleSubmit = () => {
    if (!isSubmittable) return;
    handleGenerate({ language });
  };
  
  const platformInfo = {
    platform: 'LinkedIn',
    icon: '💼',
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
          acceptedFileTypes="image/*"
          label="Attach an Image (Optional)"
        />
      </InputForm>
      
      {error && <ErrorMessage message={error} />}

      <div className="mt-8 min-h-[300px]">
        {isLoading && <LoadingSpinner message="Generating LinkedIn hashtags..." />}
        {results && <ResultsDisplay results={results} platformInfo={platformInfo} />}
        {!isLoading && !results && !error && (
          <InitialState
            title="Enhance Your LinkedIn Post"
            message="Paste your post content above to generate relevant and trending hashtags that will boost your visibility."
          />
        )}
      </div>
    </div>
  );
};
