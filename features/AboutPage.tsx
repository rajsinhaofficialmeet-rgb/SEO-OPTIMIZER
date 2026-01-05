import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { GoogleIcon, YouTubeIcon, LinkedInIcon, InstagramIcon, FacebookIcon } from '../components/PlatformIcons';

const features = [
  {
    icon: <GoogleIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
    title: 'Website SEO',
    description: 'Boost your search engine rankings with head, body, and long-tail keywords. Generate optimized meta descriptions and even get structured data (schema markup) to help search engines understand your content better.'
  },
  {
    icon: <YouTubeIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
    title: 'YouTube',
    description: 'Get trending tags, relevant description keywords, and catchy titles to grow your channel. Upload a video thumbnail for even more context-aware suggestions.'
  },
  {
    icon: <LinkedInIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
    title: 'LinkedIn',
    description: 'Maximize your professional reach with targeted hashtags that connect you with the right audience. Analyze post text and images to find the most effective tags.'
  },
  {
    icon: <InstagramIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
    title: 'Instagram',
    description: 'Amplify your engagement with a mix of popular and niche hashtags, plus an AI-generated caption perfect for your photos and videos.'
  },
  {
    icon: <FacebookIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
    title: 'Facebook',
    description: 'Craft compelling post text and hashtags to engage your community. Get suggestions for powerful calls to action to drive conversations and grow your brand.'
  },
];

interface AboutPageProps {
    theme: string;
    toggleTheme: () => void;
    navigateToHome: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ theme, toggleTheme, navigateToHome }) => {
  return (
    <div className="min-h-screen flex flex-col items-center text-zinc-800 dark:text-zinc-200 font-sans">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme}
        onLogoClick={navigateToHome}
        onHomeClick={navigateToHome}
      />
      <main className="w-full flex flex-col items-center flex-grow p-4">
        <section className="w-full max-w-5xl py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 dark:from-amber-400 dark:via-orange-300 dark:to-amber-400">
                    About Mentors Eduserv AI Content Optimizer
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
                    Our application leverages the power of Google's Gemini AI to provide you with state-of-the-art content optimization tools. Whether you're a marketer, content creator, or business owner, our suite of features is designed to enhance your digital presence and save you time.
                </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                    <div key={index} className="p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-lg border-amber-200 dark:border-zinc-700">
                        <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-100/50 dark:bg-zinc-700/50">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{feature.title}</h3>
                        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};