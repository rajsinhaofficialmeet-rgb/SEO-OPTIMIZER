import React from 'react';

interface HeroProps {
  navigateToOptimizer: () => void;
}

const Hero3DAnimation = () => {
    return (
        <div className="w-full h-40 flex items-center justify-center">
            <div className="cube-container">
                <div className="cube">
                    <div className="face front"></div>
                    <div className="face back"></div>
                    <div className="face right"></div>
                    <div className="face left"></div>
                    <div className="face top"></div>
                    <div className="face bottom"></div>
                </div>
            </div>
        </div>
    );
};

export const Hero: React.FC<HeroProps> = ({ navigateToOptimizer }) => {
  return (
    <section className="w-full text-center py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-amber-900/10 dark:to-transparent -z-10"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-200/60 dark:bg-amber-800/30 rounded-full filter blur-3xl opacity-70 animate-blob -z-10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-200/60 dark:bg-orange-800/30 rounded-full filter blur-3xl opacity-60 animate-blob animation-delay-4000 -z-10"></div>

        <div className="relative z-10 w-full grid lg:grid-cols-2 lg:gap-12 lg:text-left items-center">
            <div className="animate-fade-in-up">
                <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 dark:from-amber-400 dark:via-orange-300 dark:to-amber-400"
                    style={{ backgroundSize: '200% auto', animation: 'gradient-pan 3s linear infinite' }}>
                    Unlock Your Content's True Potential
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto lg:mx-0">
                    Supercharge your content with our AI Optimizer. Get high-impact keywords, tags, and titles for your website, YouTube, and social media in seconds.
                </p>
                <div className="mt-10">
                    <button
                        onClick={navigateToOptimizer}
                        className="px-8 py-4 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Start Optimizing Now
                    </button>
                    <div className="mt-6 flex items-center justify-center lg:justify-start gap-2">
                        <div className="flex -space-x-2">
                            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-orange-50 dark:ring-stone-950" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User avatar" />
                            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-orange-50 dark:ring-stone-950" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User avatar" />
                            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-orange-50 dark:ring-stone-950" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="User avatar" />
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Trusted by content creators worldwide</p>
                    </div>
                </div>
            </div>
            <div className="hidden lg:flex justify-center items-center mt-12 lg:mt-0 animate-fade-in-up animation-delay-200">
                <Hero3DAnimation />
            </div>
        </div>
        <style>{`
            @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob { animation: blob 7s infinite; }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-4000 { animation-delay: 4s; }

            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
                opacity: 0;
                animation: fadeInUp 0.6s ease-out forwards;
            }
            .animation-delay-200 { animation-delay: 0.2s; }
            .animation-delay-400 { animation-delay: 0.4s; }
        `}</style>
    </section>
  );
};