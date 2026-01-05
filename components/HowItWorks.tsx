import React from 'react';

const Step1Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const Step2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const Step3Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const steps = [
  {
    number: '01',
    title: 'Describe Your Content',
    description: 'Provide a description, title, or URL. The more context you give the AI, the better the results.',
    icon: <Step1Icon />
  },
  {
    number: '02',
    title: 'Add Visuals (Optional)',
    description: 'Upload an image or video to give the AI visual context for even more accurate and relevant suggestions.',
     icon: <Step2Icon />
  },
  {
    number: '03',
    title: 'Generate & Optimize',
    description: 'Receive a list of optimized keywords, tags, and titles. Copy them with a single click and boost your reach!',
     icon: <Step3Icon />
  }
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="w-full py-16 sm:py-24 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Simple Steps to Success
          </h2>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Getting started is as easy as one, two, three.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-800 rounded-xl border border-amber-200 dark:border-zinc-700 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-400/10 transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-amber-100/70 dark:bg-amber-900/50 text-3xl mb-4">
                    {step.icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{step.title}</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};