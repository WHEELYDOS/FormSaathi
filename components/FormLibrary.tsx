import React, { useState, useMemo } from 'react';
import { FORMS } from '../data/forms';
import { useLanguage } from '../contexts/LanguageContext';
import { SearchIcon, DocumentIcon } from './icons';
import { FormMetadata } from '../types';

interface FormLibraryProps {
    selectedFormPath: string | null;
    onFormSelect: (path: string) => void;
}

const FormCard: React.FC<{ form: FormMetadata; isSelected: boolean; onSelect: () => void }> = ({ form, isSelected, onSelect }) => (
    <button
        onClick={onSelect}
        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
            isSelected
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md'
        }`}
    >
        <h3 className="font-bold text-slate-800 dark:text-slate-100">{form.name}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{form.description}</p>
        <div className="mt-3 flex gap-2">
            <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{form.category}</span>
            <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{form.state}</span>
        </div>
    </button>
);

const FormLibrary: React.FC<FormLibraryProps> = ({ selectedFormPath, onFormSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stateFilter, setStateFilter] = useState('all');
    const { t } = useLanguage();

    const categories = useMemo(() => ['all', ...Array.from(new Set(FORMS.map(f => f.category)))], []);
    const states = useMemo(() => ['all', ...Array.from(new Set(FORMS.map(f => f.state)))], []);

    const filteredForms = useMemo(() => {
        return FORMS.filter(form => {
            const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) || form.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || form.category === categoryFilter;
            const matchesState = stateFilter === 'all' || form.state === stateFilter;
            return matchesSearch && matchesCategory && matchesState;
        });
    }, [searchTerm, categoryFilter, stateFilter]);
    
    const selectedForm = useMemo(() => {
        if (!selectedFormPath) return null;
        return FORMS.find(form => form.filePath === selectedFormPath) || null;
    }, [selectedFormPath]);

    const selectStyle = "block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 pl-3 pr-8 text-slate-900 dark:text-slate-200 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Form Selection */}
            <div className="space-y-4">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        placeholder={t.librarySearchPlaceholder as string}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border-0 bg-white dark:bg-slate-900 py-2 pl-10 pr-3 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500"
                    />
                </div>
            
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="category-filter" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">{t.filterByCategory as string}</label>
                            <select id="category-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={selectStyle}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? t.allCategories as string : cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="state-filter" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">{t.filterByState as string}</label>
                            <select id="state-filter" value={stateFilter} onChange={e => setStateFilter(e.target.value)} className={selectStyle}>
                               {states.map(s => <option key={s} value={s}>{s === 'all' ? t.allStates as string : s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {filteredForms.length > 0 ? (
                        filteredForms.map(form => (
                            <FormCard
                                key={form.filePath}
                                form={form}
                                isSelected={selectedFormPath === form.filePath}
                                onSelect={() => onFormSelect(form.filePath)}
                            />
                        ))
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                            {t.noFormsFound as string}
                        </p>
                    )}
                </div>
            </div>

            {/* Right Column: Form Preview */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm h-full max-h-[85vh] flex flex-col">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 p-4 border-b border-slate-200 dark:border-slate-700">
                    {t.formPreviewTitle as string}
                </h3>
                {selectedForm ? (
                     <div className="flex-grow overflow-hidden p-1 bg-slate-200 dark:bg-slate-900">
                        <iframe 
                          src={selectedForm.filePath}
                          title={`${selectedForm.name} Preview`}
                          className="w-full h-full border-0"
                        />
                     </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                        <DocumentIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">{t.formPreviewPlaceholder as string}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormLibrary;