export interface FormField {
  label: string;
  originalNumber?: string;
  type: 'text' | 'checkbox' | 'photo' | 'label';
}

export interface FormRow {
  fields: FormField[];
}

export interface FormSection {
  sectionTitle: string;
  rows: FormRow[];
  description?: string;
  isTable?: boolean;
}

export interface TranslationResult {
  formTitle: string;
  sections: FormSection[];
  simplification: string;
}

export interface Language {
  value: string;
  label: string;
}

export interface FormMetadata {
  name: string;
  description: string;
  category: 'Identity' | 'Finance' | 'Travel' | string;
  state: 'National' | string;
  filePath: string; // Used as a unique ID
}