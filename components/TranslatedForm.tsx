import React from 'react';
import { FormSection } from '../types';
import FormField from './FormField';
import { useLanguage } from '../contexts/LanguageContext';

interface TranslatedFormProps {
  formTitle: string;
  sections: FormSection[];
  icon: React.ReactNode;
}

const TranslatedForm: React.FC<TranslatedFormProps> = ({ formTitle, sections, icon }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-xl shadow-md p-6 flex flex-col relative font-serif">
      <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-slate-700">
        <div className="flex items-center">
          {icon}
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 ml-3">{formTitle}</h3>
        </div>
      </div>
      <div className="text-slate-800 dark:text-slate-200 overflow-y-auto flex-grow pr-4 -mr-4 pt-4">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h4 className="text-lg font-bold border-b-2 border-black dark:border-slate-400 pb-1 mb-4">{section.sectionTitle}</h4>
            {section.description && <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-4">{section.description}</p>}
            
            {section.isTable ? (
               <div className="overflow-x-auto border border-black dark:border-slate-600">
                <table className="w-full text-sm text-left text-black dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-700 border-b-2 border-black dark:border-slate-500">
                    <tr>
                      {section.rows[0]?.fields.map((header, headerIndex) => (
                        <th key={headerIndex} scope="col" className={`px-2 py-2 font-bold ${headerIndex < section.rows[0].fields.length - 1 ? 'border-r border-black dark:border-slate-500' : ''}`}>
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex} className={`${rowIndex < section.rows.length - 2 ? 'border-b border-slate-300 dark:border-slate-600' : ''}`}>
                       {row.fields.map((field, cellIndex) => (
                           <td key={cellIndex} className={`px-2 py-1 h-9 ${cellIndex < row.fields.length - 1 ? 'border-r border-slate-300 dark:border-slate-600' : ''}`}>
                           </td>
                       ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                {section.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex flex-row flex-wrap space-x-4 items-end">
                    {row.fields.map((field, fieldIndex) => (
                      <FormField
                        key={fieldIndex}
                        field={field}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslatedForm;