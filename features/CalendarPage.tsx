import React, { useState } from 'react';
import { useCalendar, ScheduledPost } from '../hooks/useCalendar';
import { Calendar } from '../components/Calendar';
import { DayPostsModal } from '../components/DayPostsModal';
import { InitialState } from '../components/InitialState';

const ArrowLeft = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ArrowRight = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

export const CalendarPage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { posts, updatePost, deletePost } = useCalendar();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleDayClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const postsForDay = posts.filter(post => {
            const postDate = new Date(post.scheduledAt);
            return postDate.getFullYear() === date.getFullYear() &&
                   postDate.getMonth() === date.getMonth() &&
                   postDate.getDate() === date.getDate();
        });
        if (postsForDay.length > 0) {
            setSelectedDate(date);
            setIsModalOpen(true);
        }
    };

    const selectedDayPosts = selectedDate
        ? posts.filter(post => {
            const postDate = new Date(post.scheduledAt);
            return postDate.getFullYear() === selectedDate.getFullYear() &&
                   postDate.getMonth() === selectedDate.getMonth() &&
                   postDate.getDate() === selectedDate.getDate();
        })
        : [];
        
    if (posts.length === 0) {
        return <InitialState title="Content Calendar is Empty" message="Generate content and use the 'Schedule' button to start planning your posts." />;
    }

    return (
        <div className="w-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
                <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-amber-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300" aria-label="Previous month"><ArrowLeft /></button>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                     <button onClick={goToToday} className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                        Go to Today
                    </button>
                </div>
                <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-amber-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300" aria-label="Next month"><ArrowRight /></button>
            </div>
            <Calendar
                date={currentDate}
                posts={posts}
                onDayClick={handleDayClick}
            />
            {isModalOpen && selectedDate && (
                <DayPostsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    date={selectedDate}
                    posts={selectedDayPosts}
                    onUpdatePost={updatePost}
                    onDeletePost={deletePost}
                />
            )}
        </div>
    );
};
