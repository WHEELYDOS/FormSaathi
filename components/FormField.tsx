import React from 'react';
import { FormField as FormFieldType } from '../types';

interface FormFieldProps {
  field: FormFieldType;
}

const FormField: React.FC<FormFieldProps> = ({ field }) => {
  const isSideLabel = field.label.trim().endsWith(':');
  const labelText = isSideLabel ? field.label.trim().slice(0, -1) : field.label;

  const fullLabel = (
    <span className="text-black dark:text-slate-200">
      {field.originalNumber && <span className="font-bold mr-2">{field.originalNumber}</span>}
      {labelText}
    </span>
  );

  switch (field.type) {
    case 'label':
      return <div className="flex items-end pb-1 h-8 font-semibold">{fullLabel}{isSideLabel && ':'}</div>;

    case 'checkbox':
      return (
        <div className="flex items-center self-end pb-1 h-8">
          <div className="w-4 h-4 mr-2 border border-black dark:border-slate-400" />
          <label className="text-black dark:text-slate-200">{field.label}</label>
        </div>
      );

    case 'photo':
      return (
        <div className="w-32 h-40 border-2 border-dashed border-slate-600 dark:border-slate-500 flex items-center justify-center text-center p-2 text-sm text-slate-700 dark:text-slate-400">
          {field.label}
        </div>
      );
    
    case 'text':
      if (isSideLabel) {
        return (
          <div className="flex items-center flex-grow-[999] basis-0 self-end w-full">
            <label className="mr-2 whitespace-nowrap">{fullLabel}:</label>
            <div
              className="border-b-2 border-dotted border-black dark:border-slate-400 w-full h-7 bg-transparent"
            />
          </div>
        );
      } else {
        return (
          <div className="flex flex-col flex-1 min-w-[150px] mb-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{fullLabel}</label>
            <div
              className="border border-black dark:border-slate-400 w-full h-8 rounded-sm p-1 bg-white dark:bg-slate-700"
            />
          </div>
        );
      }
      
    default:
      return null;
  }
};

export default FormField;