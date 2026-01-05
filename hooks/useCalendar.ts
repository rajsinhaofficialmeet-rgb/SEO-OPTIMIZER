import { useState, useEffect, useCallback } from 'react';

export interface ScheduledPost {
  id: string;
  platform: string;
  icon: string;
  userInput: string;
  results: Record<string, any>;
  scheduledAt: string; // ISO string
  language?: string;
}

const CALENDAR_STORAGE_KEY = 'contentCalendar';

export const useCalendar = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);

  useEffect(() => {
    try {
      const storedPosts = localStorage.getItem(CALENDAR_STORAGE_KEY);
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      }
    } catch (error) {
      console.error("Failed to load calendar from localStorage", error);
      setPosts([]);
    }
  }, []);

  const savePosts = (updatedPosts: ScheduledPost[]) => {
    try {
      const sortedPosts = updatedPosts.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(sortedPosts));
      setPosts(sortedPosts);
    } catch (error) {
      console.error("Failed to save calendar to localStorage", error);
    }
  };

  const addPost = useCallback((post: Omit<ScheduledPost, 'id'>) => {
    const newPost: ScheduledPost = {
      ...post,
      id: `${Date.now()}-${Math.random()}`,
    };
    savePosts([...posts, newPost]);
  }, [posts]);

  const updatePost = useCallback((postId: string, updates: Partial<Omit<ScheduledPost, 'id'>>) => {
    const updatedPosts = posts.map(p =>
      p.id === postId ? { ...p, ...updates } : p
    );
    savePosts(updatedPosts);
  }, [posts]);

  const deletePost = useCallback((postId: string) => {
    const filteredPosts = posts.filter(p => p.id !== postId);
    savePosts(filteredPosts);
  }, [posts]);

  return { posts, addPost, updatePost, deletePost };
};
