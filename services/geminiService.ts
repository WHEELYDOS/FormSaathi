
import { TranslationResult } from '../types';

// Backend API URL - change this to your backend URL in production
const API_BASE_URL = 'http://localhost:8000';

export const translateAndSimplifyForm = async (
  input: File | string,
  inputType: 'file' | 'text',
  targetLanguage: string
): Promise<TranslationResult> => {
  
  try {
    const formData = new FormData();
    formData.append('target_language', targetLanguage);
    formData.append('input_type', inputType);
    
    if (inputType === 'file') {
      const file = input as File;
      formData.append('file', file);
    } else {
      const textContent = input as string;
      formData.append('text_content', textContent);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/translate`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Basic validation to ensure the response shape is correct
    if (
        result && 
        typeof result.formTitle === 'string' &&
        Array.isArray(result.sections) &&
        typeof result.simplification === 'string'
    ) {
      return result as TranslationResult;
    } else {
      throw new Error("Invalid response format from API. The JSON structure is incorrect.");
    }
  } catch (error) {
    console.error("Error calling backend API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to process the form: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the backend service.');
  }
};