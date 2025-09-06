import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Loader: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-md h-full p-12 text-center absolute inset-0 z-10">
      <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {/* FIX: Cast to string to satisfy ReactNode type */}
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-4">{t.loaderTitle as string}</h2>
      {/* FIX: Cast to string to satisfy ReactNode type */}
      <p className="text-slate-500 dark:text-slate-400 mt-2">{t.loaderSubtitle as string}</p>
    </div>
  );
};

export default Loader;