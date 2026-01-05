import React, { useState, useEffect } from 'react';
import { useCalendar, ScheduledPost } from '../hooks/useCalendar';

interface PostData {
    platform: string;
    icon: string;
    userInput: string;
    results: Record<string, any>;
    language?: string;
}

interface SchedulePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    postData: PostData;
    existingPost?: ScheduledPost;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


export const SchedulePostModal: React.FC<SchedulePostModalProps> = ({ isOpen, onClose, postData, existingPost }) => {
    const { addPost, updatePost } = useCalendar();
    
    const getInitialDateTime = () => {
        const date = existingPost ? new Date(existingPost.scheduledAt) : new Date();
        if (!existingPost) {
           date.setHours(date.getHours() + 1);
           date.setMinutes(0);
        }
        // Format to yyyy-MM-ddThh:mm
        return date.toISOString().slice(0, 16);
    };
    
    const [scheduledAt, setScheduledAt] = useState(getInitialDateTime());
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsSaved(false);
            setScheduledAt(getInitialDateTime());
        }
    }, [isOpen, existingPost]);

    if (!isOpen) return null;

    const handleSave = () => {
        const scheduledDate = new Date(scheduledAt);
        if (isNaN(scheduledDate.getTime())) {
            alert("Please enter a valid date and time.");
            return;
        }

        if (existingPost) {
            updatePost(existingPost.id, { ...postData, scheduledAt: scheduledDate.toISOString() });
        } else {
            addPost({ ...postData, scheduledAt: scheduledDate.toISOString() });
        }
        setIsSaved(true);
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const getPostTextPreview = () => {
        const key = Object.keys(postData.results).find(k => k.toLowerCase().includes('post') || k.toLowerCase().includes('caption') || k.toLowerCase().includes('description'));
        return key ? String(postData.results[key][0] || 'No text content available.') : 'No text content available.';
    };

    return (
        <div
            className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-fast"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-orange-50 dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-amber-200 dark:border-zinc-700 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                           {existingPost ? 'Edit Schedule' : 'Schedule Post'}
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400">Plan your content for {postData.platform}.</p>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 -mt-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full transition-colors" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="mt-6">
                    <label htmlFor="schedule-datetime" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Date and Time
                    </label>
                    <input
                        type="datetime-local"
                        id="schedule-datetime"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="mt-1 w-full p-2 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
                    />
                </div>

                 <div className="mt-6">
                    <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Content Preview</h3>
                    <div className="p-3 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg max-h-32 overflow-y-auto">
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap break-words">
                            {getPostTextPreview()}
                        </p>
                    </div>
                </div>


                <div className="mt-8 border-t border-amber-200 dark:border-zinc-700 pt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaved}
                        className="w-full sm:w-auto flex items-center justify-center px-6 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:bg-green-600 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
                    >
                        {isSaved ? <><CheckIcon /> Saved!</> : (existingPost ? 'Update Schedule' : 'Add to Calendar')}
                    </button>
                </div>
            </div>
        </div>
    );
};
