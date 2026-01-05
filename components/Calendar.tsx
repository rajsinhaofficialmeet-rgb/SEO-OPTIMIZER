import React from 'react';
import { ScheduledPost } from '../hooks/useCalendar';
import { YouTubeIcon, LinkedInIcon, InstagramIcon, FacebookIcon } from './PlatformIcons';

interface CalendarProps {
  date: Date;
  posts: ScheduledPost[];
  onDayClick: (day: number) => void;
}

const platformColors: { [key: string]: string } = {
  YouTube: 'bg-red-500',
  LinkedIn: 'bg-blue-700',
  Instagram: 'bg-pink-500',
  Facebook: 'bg-blue-600',
};

const PlatformIndicator: React.FC<{ platform: string }> = ({ platform }) => {
    const colorClass = platformColors[platform] || 'bg-gray-400';
    return <div className={`w-2 h-2 rounded-full ${colorClass}`} title={platform}></div>;
};

export const Calendar: React.FC<CalendarProps> = ({ date, posts, onDayClick }) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`blank-${i}`} className="p-1"></div>);

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNumber = i + 1;
    const isToday = today.getDate() === dayNumber && today.getMonth() === month && today.getFullYear() === year;

    const postsForDay = posts.filter(post => {
      const postDate = new Date(post.scheduledAt);
      return postDate.getDate() === dayNumber && postDate.getMonth() === month && postDate.getFullYear() === year;
    });

    const hasPosts = postsForDay.length > 0;
    const uniquePlatforms = [...new Set(postsForDay.map(p => p.platform))];

    return (
      <div
        key={dayNumber}
        onClick={() => onDayClick(dayNumber)}
        className={`p-1 sm:p-2 h-20 sm:h-24 flex flex-col rounded-lg transition-colors duration-200 ${hasPosts ? 'cursor-pointer hover:bg-amber-100/50 dark:hover:bg-zinc-700/50' : ''}`}
      >
        <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-amber-500 text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
          {dayNumber}
        </div>
        {hasPosts && (
          <div className="mt-1 flex flex-wrap gap-1">
            {uniquePlatforms.slice(0, 4).map(platform => <PlatformIndicator key={platform} platform={platform} />)}
          </div>
        )}
      </div>
    );
  });

  return (
    <div>
      <div className="grid grid-cols-7 text-center text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks}
        {days}
      </div>
    </div>
  );
};