import React, { useState } from 'react';
import { ScheduledPost } from '../hooks/useCalendar';
import { SchedulePostModal } from './SchedulePostModal';
import { PlatformIcon } from '../features/HistoryDisplay'; // Re-using this component

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

interface DayPostsModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    posts: ScheduledPost[];
    onUpdatePost: (postId: string, updates: Partial<Omit<ScheduledPost, 'id'>>) => void;
    onDeletePost: (postId: string) => void;
}

export const DayPostsModal: React.FC<DayPostsModalProps> = ({ isOpen, onClose, date, posts, onUpdatePost, onDeletePost }) => {
    const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);

    if (!isOpen) return null;
    
    const handleEdit = (post: ScheduledPost) => {
        setEditingPost(post);
    };

    const handleDelete = (postId: string) => {
        if (window.confirm("Are you sure you want to delete this scheduled post?")) {
            onDeletePost(postId);
        }
    };
    
    const closeEditModal = () => {
        setEditingPost(null);
    }
    
    const handleUpdate = (postId: string, updates: Partial<Omit<ScheduledPost, 'id'>>) => {
        onUpdatePost(postId, updates);
    };


    return (
        <>
            <div
                className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-fast"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
            >
                <div
                    className="bg-orange-50 dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 border border-amber-200 dark:border-zinc-700 animate-scale-in max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                                Posts for {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 -mt-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full transition-colors" aria-label="Close modal">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="overflow-y-auto space-y-4 pr-2 -mr-2">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <div key={post.id} className="p-3 sm:p-4 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg flex items-start gap-3 sm:gap-4">
                                    <div className="flex-shrink-0 pt-1">
                                      <PlatformIcon platform={post.platform} fallbackIcon={post.icon} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold text-zinc-800 dark:text-zinc-200">{post.platform} Post</p>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-semibold mb-2">
                                            Scheduled for {new Date(post.scheduledAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                        </p>
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words italic">
                                            "{post.userInput || 'File-only submission'}"
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleEdit(post)} className="p-2 rounded-lg bg-white/50 dark:bg-zinc-700/50 hover:bg-white text-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700" aria-label="Edit post"><EditIcon/></button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg bg-white/50 dark:bg-zinc-700/50 hover:bg-red-100 text-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700 hover:text-red-600" aria-label="Delete post"><TrashIcon/></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">No posts scheduled for this day.</p>
                        )}
                    </div>
                </div>
            </div>
            {editingPost && (
                <SchedulePostModal
                    isOpen={!!editingPost}
                    onClose={closeEditModal}
                    postData={editingPost}
                    existingPost={editingPost}
                />
            )}
        </>
    );
};