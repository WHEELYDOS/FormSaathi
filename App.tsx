import React, { useState, useCallback } from 'react';
import { translateAndSimplifyForm } from './services/geminiService';
import { TranslationResult } from './types';
import { SUPPORTED_LANGUAGES } from './constants';
import { FORMS } from './data/forms';
import FormInput from './components/FormInput';
import Loader from './components/Loader';
import { LogoIcon, InfoIcon, CopyIcon } from './components/icons';
import { useLanguage } from './contexts/LanguageContext';
import LanguageSelector from './components/LanguageSelector';
import ThemeToggler from './components/ThemeToggler';
import TranslatedForm from './components/TranslatedForm';

const ResultCard: React.FC<{ title: string; content: string; icon: React.ReactNode; copiedText: string; }> = ({ title, content, icon, copiedText }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }, [content]);

  return (
    <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-xl shadow-md p-6 h-full flex flex-col relative">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 ml-3">{title}</h3>
      </div>
      <button 
        onClick={handleCopy}
        className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        aria-label="Copy explanation"
      >
        {isCopied ? (
          <span className="text-sm text-blue-600 font-semibold">{copiedText}</span>
        ) : (
          <CopyIcon className="h-5 w-5" />
        )}
      </button>
      <div className="prose prose-slate max-w-none text-slate-600 dark:text-slate-300 overflow-y-auto flex-grow">
        {content.split('\n').map((line, index) => (
          <p key={index} className="mb-2">{line}</p>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>(SUPPORTED_LANGUAGES[0].value);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputType, setInputType] = useState<'file' | 'library' | 'text'>('file');
  const [formText, setFormText] = useState<string>('');
  const [selectedFormPath, setSelectedFormPath] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleFileChange = (file: File | null) => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setInputType('file');
      setFormText('');
      setSelectedFormPath(null);
    } else {
      setImagePreview(null);
    }
    setResult(null);
    setError(null);
  };

  const handleTextChange = (text: string) => {
      setFormText(text);
      if (text) {
        handleFileChange(null);
        setInputType('text');
        setSelectedFormPath(null);
      }
  };


  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      switch (inputType) {
        case 'file':
          if (!imageFile) throw new Error('Please upload a form image or PDF first.');
          response = await translateAndSimplifyForm(imageFile, 'file', targetLanguage);
          break;
        case 'library':
          if (!selectedFormPath) throw new Error('Please select a form from the library.');
          
          const selectedForm = FORMS.find(form => form.filePath === selectedFormPath);
          if (!selectedForm) {
            throw new Error('Selected form could not be found.');
          }

          // Extract file ID from Google Drive preview URL
          const urlParts = selectedForm.filePath.split('/d/');
          if (urlParts.length < 2) {
              throw new Error('Invalid Google Drive link format in form library.');
          }
          const fileId = urlParts[1].split('/')[0];
          const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          
          // A backend proxy is the ideal solution for CORS issues. 
          // In this client-only environment, a public CORS proxy is used as a workaround 
          // to fetch the form from Google Drive, which doesn't allow direct cross-origin requests from a browser.
          // This approach is not recommended for production apps due to reliability and security concerns.
          const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(downloadUrl)}`;

          let pdfResponse;
          try {
              // Attempt to fetch the PDF file via the CORS proxy.
              pdfResponse = await fetch(proxiedUrl);
          } catch (e) {
              console.error("Fetch error:", e);
              throw new Error('A network error occurred while trying to fetch the form. This could be due to browser security restrictions (CORS). Please try the "Upload File" tab instead.');
          }

          if (!pdfResponse.ok) {
              throw new Error(`Failed to download form (status: ${pdfResponse.status}). The link may be invalid, private, or the proxy may be down.`);
          }

          const pdfBlob = await pdfResponse.blob();

          // Google Drive sometimes returns an HTML confirmation page instead of the file for large files.
          if (pdfBlob.type.includes('text/html')) {
              throw new Error('Could not download the form directly. Please use the "Upload File" tab to upload it manually.');
          }

          const pdfFile = new File([pdfBlob], `${selectedForm.name}.pdf`, { type: 'application/pdf' });
          
          response = await translateAndSimplifyForm(pdfFile, 'file', targetLanguage);
          break;
        case 'text':
          if (!formText.trim()) throw new Error('Please paste the form text.');
          response = await translateAndSimplifyForm(formText, 'text', targetLanguage);
          break;
        default:
          throw new Error("Invalid input type.");
      }
      setResult(response);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, targetLanguage, inputType, formText, selectedFormPath]);
  

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10 relative">
            <div className="absolute top-0 right-0 z-20 flex items-center space-x-2">
              <LanguageSelector />
              <ThemeToggler />
            </div>
          <div className="flex justify-center items-center mb-4">
            <LogoIcon className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 ml-4 tracking-tight">
              {/* FIX: Cast to string to satisfy ReactNode type */}
              {t.appTitle as string}
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            {/* FIX: Cast to string to satisfy ReactNode type */}
            {t.appSubtitle as string}
          </p>
        </header>

        <main className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <FormInput
              onFileChange={handleFileChange}
              onLanguageChange={setTargetLanguage}
              onSubmit={handleSubmit}
              targetLanguage={targetLanguage}
              isLoading={isLoading}
              imageFile={imageFile}
              imagePreview={imagePreview}
              inputType={inputType}
              onInputTypeChange={setInputType}
              formText={formText}
              onTextChange={handleTextChange}
              selectedFormPath={selectedFormPath}
              onFormPathChange={setSelectedFormPath}
            />
          </div>
          
          <div className="min-h-[60vh] relative">
            {isLoading && <Loader />}
            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
                  {/* FIX: Cast to string to satisfy ReactNode type */}
                  <p className="font-bold">{t.errorTitle as string}</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
            {!isLoading && !error && result && (
              <div className="space-y-8">
                <TranslatedForm
                  formTitle={result.formTitle}
                  sections={result.sections}
                  icon={<InfoIcon className="h-6 w-6 text-blue-500" />}
                />
                {/* FIX: Cast title and copiedText to string to satisfy component prop types */}
                <ResultCard title={t.resultCardTitle as string} content={result.simplification} icon={<InfoIcon className="h-6 w-6 text-green-500" />} copiedText={t.copied as string} />
              </div>
            )}
            {!isLoading && !error && !result && (
              <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-xl shadow-md h-full p-12 text-center">
                <InfoIcon className="h-16 w-16 text-slate-300 mb-4" />
                {/* FIX: Cast to string to satisfy ReactNode type */}
                <h2 className="text-2xl font-semibold text-slate-600 dark:text-slate-300">{t.placeholderTitle as string}</h2>
                {/* FIX: Cast to string to satisfy ReactNode type */}
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">{t.placeholderSubtitle as string}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;