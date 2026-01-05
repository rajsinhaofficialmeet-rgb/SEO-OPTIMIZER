import React from 'react';

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Dutch', 'Russian', 'Japanese', 'Chinese (Simplified)', 'Korean', 'Arabic', 'Hindi', 'Hinglish'
];

interface LanguageSelectorProps {
  language: string;
  setLanguage: (language: string) => void;
  disabled: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage, disabled }) => {
  return (
    <div className="mt-4">
      <label htmlFor="language-select" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
        Output Language
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="mt-1 w-full p-2 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
        disabled={disabled}
        aria-label="Output Language"
      >
        {languages.map(lang => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
    </div>
  );
};