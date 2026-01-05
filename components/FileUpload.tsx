import React, { useState, useRef, useCallback } from 'react';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

interface FileUploadProps {
    onFileSelect: (fileData: { mimeType: string; data: string; } | null) => void;
    disabled: boolean;
    acceptedFileTypes: string;
    label: string;
}

const MAX_FILE_SIZE_MB = 499;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled, acceptedFileTypes, label }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = event.target.files?.[0];
        if (!file) {
            setFileName(null);
            onFileSelect(null);
            return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(`File is too large. Please select a file under ${MAX_FILE_SIZE_MB}MB.`);
            setFileName(null);
            onFileSelect(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setFileName(file.name);

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            if (base64Data) {
                 onFileSelect({
                    mimeType: file.type,
                    data: base64Data,
                });
            } else {
                console.error("Failed to read file as base64 data.");
                setError("Could not process the selected file.");
                setFileName(null);
                onFileSelect(null);
            }
        };
        reader.onerror = () => {
             console.error("Error reading file.");
             setError("There was an error reading the file.");
             setFileName(null);
             onFileSelect(null);
        };
        reader.readAsDataURL(file);
    }, [onFileSelect]);
    
    const handleRemoveFile = useCallback(() => {
        setFileName(null);
        setError(null);
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onFileSelect]);

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {label}
            </label>
            <div className="mt-1">
                {!fileName ? (
                    <button
                        type="button"
                        onClick={triggerFileSelect}
                        disabled={disabled}
                        className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-amber-300 dark:border-zinc-600 rounded-md text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-amber-100/50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                       <UploadIcon />
                       Attach a file for better suggestions
                    </button>
                ) : (
                    <div className="flex items-center justify-between p-2.5 bg-amber-100/50 dark:bg-zinc-900/50 rounded-md text-sm">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate pr-2">
                            {fileName}
                        </span>
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            disabled={disabled}
                            className="p-1 rounded-full text-zinc-500 hover:bg-amber-200 dark:hover:bg-zinc-700 hover:text-red-600 dark:hover:text-red-500 disabled:opacity-50 transition-colors"
                            aria-label="Remove file"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                )}
                 <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept={acceptedFileTypes}
                    className="hidden"
                    disabled={disabled}
                />
            </div>
            {error ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Max file size: {MAX_FILE_SIZE_MB}MB.</p>
            )}
        </div>
    );
};