import React from 'react';
import { LoadingSpinnerIcon } from './LoadingSpinner';

interface InputFormProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  label: string;
  placeholder: string;
  isSubmittable?: boolean;
  children?: React.ReactNode;
  maxLength?: number;
  inputError?: string | null;
  textareaHeight?: string;
}

export const InputForm: React.FC<InputFormProps> = ({ userInput, setUserInput, onSubmit, isLoading, label, placeholder, isSubmittable, children, maxLength, inputError, textareaHeight }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };
  
  const submittable = isSubmittable !== undefined ? isSubmittable : !!userInput.trim();

  return (
    <div className="w-full p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700">
      <label htmlFor="user-input" className="block text-lg font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <textarea
        id="user-input"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`mt-3 w-full p-3 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 resize-none ${textareaHeight || 'h-32'}`}
        disabled={isLoading}
        aria-label={label}
      />

      <div className="mt-1 flex justify-between items-center text-xs">
        {inputError ? (
          <p className="text-red-600 dark:text-red-400 font-semibold">
            {inputError}
          </p>
        ) : <div />}
        {maxLength && (
          <p className={`text-zinc-500 dark:text-zinc-400 ${inputError ? 'font-bold text-red-600 dark:text-red-400' : ''}`}>
            {userInput.length.toLocaleString()}/{maxLength.toLocaleString()}
          </p>
        )}
      </div>

      {children}

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-0">
          Tip: Press <kbd className="font-sans font-semibold p-1 bg-amber-200 dark:bg-zinc-600 rounded">Ctrl + Enter</kbd> to submit.
        </p>
        <button
          onClick={onSubmit}
          disabled={isLoading || !submittable}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <LoadingSpinnerIcon />
              Generating...
            </>
          ) : (
            'Generate'
          )}
        </button>
      </div>
    </div>
  );
};