import React from 'react';

const BulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-400 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

interface InitialStateProps {
    title: string;
    message: string;
}

export const InitialState: React.FC<InitialStateProps> = ({ title, message }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-10 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700">
            <BulbIcon />
            <h2 className="mt-4 text-xl font-bold text-zinc-800 dark:text-zinc-200">
                {title}
            </h2>
            <p className="mt-2 max-w-md text-zinc-600 dark:text-zinc-400">
                {message}
            </p>
        </div>
    );
};