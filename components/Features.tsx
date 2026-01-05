import React, { useRef } from 'react';
import { GoogleIcon, YouTubeIcon, LinkedInIcon, InstagramIcon, FacebookIcon } from './PlatformIcons';

const features = [
  {
    icon: <GoogleIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
    title: 'Website SEO',
    description: 'Boost your search engine rankings with head, body, and long-tail keywords tailored to your business.',
    tabId: 'seo',
  },
  {
    icon: <YouTubeIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
    title: 'YouTube',
    description: 'Get trending tags, description keywords, and catchy titles to grow your channel and increase views.',
    tabId: 'youtube',
  },
  {
    icon: <LinkedInIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
    title: 'LinkedIn',
    description: 'Maximize your professional reach with targeted hashtags that connect you with the right audience.',
    tabId: 'linkedin',
  },
  {
    icon: <InstagramIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
    title: 'Instagram',
    description: 'Amplify your engagement with a mix of popular and niche hashtags perfect for your photos and videos.',
    tabId: 'instagram',
  },
  {
    icon: <FacebookIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
    title: 'Facebook',
    description: 'Craft compelling posts and hashtags to engage your community, drive conversations, and grow your brand.',
    tabId: 'facebook',
  },
];


const FeatureCard: React.FC<{ feature: typeof features[0]; onClick: () => void }> = ({ feature, onClick }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = card.offsetWidth / 2;
        const centerY = card.offsetHeight / 2;

        const rotateX = (y - centerY) / 10; // Adjust divisor for sensitivity
        const rotateY = -(x - centerX) / 10;

        card.style.setProperty('--rotate-x', `${rotateX}deg`);
        card.style.setProperty('--rotate-y', `${rotateY}deg`);
        card.style.setProperty('--glow-x', `${x}px`);
        card.style.setProperty('--glow-y', `${y}px`);
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        card.style.setProperty('--rotate-x', '0deg');
        card.style.setProperty('--rotate-y', '0deg');
    };

    return (
        <div 
          className="feature-card-3d rounded-xl h-full cursor-pointer group"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          ref={cardRef}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
          aria-label={`Go to ${feature.title} optimizer`}
        >
            <div className="feature-card-inner p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-lg border-amber-200 dark:border-zinc-700 h-full">
                <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-100/50 dark:bg-zinc-700/50 group-hover:bg-amber-100 dark:group-hover:bg-zinc-700 transition-colors duration-300">
                    {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{feature.title}</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{feature.description}</p>
            </div>
            <div className="feature-card-glow"></div>
        </div>
    );
};

interface FeaturesProps {
  navigateToOptimizer: (tab: string) => void;
}

export const Features: React.FC<FeaturesProps> = ({ navigateToOptimizer }) => {
  return (
    <section className="w-full py-16 sm:py-24">
       <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
            An Optimizer for Every Platform
          </h2>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Tailored AI suggestions designed to maximize your impact on the platforms that matter most.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} onClick={() => navigateToOptimizer(feature.tabId)} />
          ))}
        </div>
      </div>
    </section>
  );
};