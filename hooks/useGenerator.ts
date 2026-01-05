import { useState, useCallback } from 'react';
import type { KeywordWithMetadata } from '../services/geminiService';

export interface HistoryItem {
  id: number;
  platform: string;
  icon: string;
  userInput: string;
  results: Record<string, any>;
  timestamp: string;
  language?: string;
}

export const saveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  const newHistoryItem: HistoryItem = {
    ...item,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  };

  try {
    const existingHistoryRaw = localStorage.getItem('generationHistory');
    const existingHistory: HistoryItem[] = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : [];
    
    const updatedHistory = [newHistoryItem, ...existingHistory];

    localStorage.setItem('generationHistory', JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save to history:", error);
  }
};

export interface GeneratorOptions {
    platformName: string;
    platformIcon: string;
}

// FIX: Constrained T to ensure results are always a record of string to array, fixing downstream type errors.
export const useGenerator = <T extends Record<string, (string | KeywordWithMetadata)[]>>(
  generateFn: (input: string) => Promise<T>,
  options?: GeneratorOptions
) => {
  const [userInput, setUserInput] = useState<string>('');
  const [results, setResults] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runGeneration = useCallback(async (generationPromise: Promise<T>, inputText: string, historyContext?: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const result = await generationPromise;
      setResults(result);
      if (options) {
        saveToHistory({ 
          platform: options.platformName,
          icon: options.platformIcon,
          userInput: inputText,
          // FIX: Removed 'as any' cast as T is now properly constrained.
          results: result,
          ...(historyContext || {}),
        });
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate content. ${errorMessage} Please try again in a moment.`);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const handleGenerate = useCallback(async (historyContext?: Record<string, any>) => {
    // The calling component is responsible for checking if submission is allowed
    // (e.g., non-empty text or a file is present)
    await runGeneration(generateFn(userInput), userInput, historyContext);
  }, [userInput, generateFn, runGeneration]);

  return {
    userInput,
    setUserInput,
    results,
    isLoading,
    error,
    handleGenerate,
  };
};