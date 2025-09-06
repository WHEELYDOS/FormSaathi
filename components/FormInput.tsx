import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { TranslateIcon, ChevronDownIcon, SearchIcon, UploadIcon, LibraryIcon, TextIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import FormLibrary from './FormLibrary';

interface FormInputProps {
  onFileChange: (file: File | null) => void;
  onLanguageChange: (language: string) => void;
  onSubmit: () => void;
  targetLanguage: string;
  isLoading: boolean;
  imageFile: File | null;
  imagePreview: string | null;
  inputType: 'file' | 'library' | 'text';
  onInputTypeChange: (type: 'file' | 'library' | 'text') => void;
  formText: string;
  onTextChange: (text: string) => void;
  selectedFormPath: string | null;
  onFormPathChange: (path: string) => void;
}

const FormInput: React.FC<FormInputProps> = ({
  onFileChange,
  onLanguageChange,
  onSubmit,
  targetLanguage,
  isLoading,
  imageFile,
  imagePreview,
  inputType,
  onInputTypeChange,
  formText,
  onTextChange,
  selectedFormPath,
  onFormPathChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    onFileChange(file || null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onFileChange(file || null);
  };

  const selectedLanguageLabel = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(lang => lang.value === targetLanguage)?.label || 'Select Language';
  }, [targetLanguage]);

  const filteredLanguages = useMemo(() => {
    if (!searchTerm) {
      return SUPPORTED_LANGUAGES;
    }
    return SUPPORTED_LANGUAGES.filter(lang =>
      lang.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const tabs = [
    { name: 'file' as const, label: t.tabUploadFile as string, icon: UploadIcon },
    { name: 'library' as const, label: t.tabFormLibrary as string, icon: LibraryIcon },
    { name: 'text' as const, label: t.tabPasteText as string, icon: TextIcon },
  ];

  const isSubmitDisabled = isLoading ||
    (inputType === 'file' && !imageFile) ||
    (inputType === 'library' && !selectedFormPath) ||
    (inputType === 'text' && !formText.trim());

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center mb-4">
          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold mr-3">1</span>
          {t.formStep1 as string}
        </h2>
        
        <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => onInputTypeChange(tab.name)}
                        className={`
                            ${inputType === tab.name
                                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                            }
                            flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none
                        `}
                        aria-current={inputType === tab.name ? 'page' : undefined}
                    >
                        <tab.icon className="-ml-0.5 mr-2 h-5 w-5" />
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>

        <div className="mt-4">
            {inputType === 'file' && (
                 <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600'} border-dashed rounded-md transition-colors`}
                >
                    <div className="space-y-1 text-center">
                        {imagePreview && imageFile ? (
                        <div className="flex flex-col items-center">
                            {imageFile.type === 'application/pdf' ? (
                            <div className="bg-slate-200 dark:bg-slate-700 p-4 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                                </svg>
                            </div>
                            ) : (
                            <img src={imagePreview} alt="Preview" className="mx-auto h-32 max-h-32 object-contain rounded-md" />
                            )}
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 truncate max-w-xs font-medium" title={imageFile.name}>{imageFile.name}</p>
                            <button onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 mt-1 focus:outline-none">
                            {t.changeFile as string}
                            </button>
                        </div>
                        ) : (
                        <>
                            <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                            <div className="flex text-sm text-slate-600 dark:text-slate-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-transparent rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:focus-within:ring-offset-slate-800">
                                <span>{t.uploadCTA1 as string}</span>
                            </label>
                            <p className="pl-1">{t.uploadCTA2 as string}</p>
                            </div>
                            <p className="text-xs text-slate-500">{t.uploadHint as string}</p>
                        </>
                        )}
                    </div>
                    <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, application/pdf" onChange={handleFileSelect} />
                </div>
            )}
            {inputType === 'library' && (
                 <FormLibrary selectedFormPath={selectedFormPath} onFormSelect={onFormPathChange} />
            )}
            {inputType === 'text' && (
                <div>
                    <textarea 
                        rows={6}
                        placeholder={t.textAreaPlaceholder as string}
                        value={formText}
                        onChange={(e) => onTextChange(e.target.value)}
                        className="w-full rounded-md border-0 bg-white dark:bg-slate-900 py-2 px-3 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500"
                    />
                </div>
            )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center mb-4">
          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold mr-3">2</span>
          {t.formStep2 as string}
        </h2>
        <div ref={dropdownRef} className="relative">
          <button
            id="language-btn"
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative w-full cursor-pointer rounded-md bg-white dark:bg-slate-900 py-2.5 pl-3 pr-10 text-left text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <span className="block truncate">{selectedLanguageLabel}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </span>
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white/10 focus:outline-none sm:text-sm">
              <div className="p-2">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    placeholder={t.languageSearchPlaceholder as string}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-md border-0 bg-gray-100 dark:bg-slate-700 py-2 pl-10 pr-3 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500"
                  />
                </div>
              </div>
              <ul role="listbox">
                {filteredLanguages.map((lang) => (
                  <li key={lang.value} className="text-gray-900 dark:text-slate-300 relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50 dark:hover:bg-blue-600/20" id={`option-${lang.value}`} role="option" aria-selected={lang.value === targetLanguage}>
                    <button
                      onClick={() => {
                        onLanguageChange(lang.value);
                        setIsDropdownOpen(false);
                        setSearchTerm('');
                      }}
                      className="w-full text-left"
                    >
                      <span className={`block truncate ${lang.value === targetLanguage ? 'font-semibold' : 'font-normal'}`}>{lang.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors dark:focus:ring-offset-slate-800 dark:disabled:bg-slate-600"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t.submitButtonLoading as string}
          </>
        ) : (
          <>
            <TranslateIcon className="h-5 w-5 mr-2" />
            {t.submitButton as string}
          </>
        )}
      </button>
    </div>
  );
};

export default FormInput;