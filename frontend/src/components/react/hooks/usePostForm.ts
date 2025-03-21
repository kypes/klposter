import { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';

interface PostFormData {
  title: string;
  description: string;
  trackList: string;
  externalUrl: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

const STORAGE_KEY = 'post_draft';

const defaultFormData: PostFormData = {
  title: '',
  description: '',
  trackList: '',
  externalUrl: '',
  scheduledDate: '',
  scheduledTime: '',
};

export function usePostForm(initialData?: PostFormData) {
  // Initialize state from localStorage or defaults
  const [formData, setFormData] = useState<PostFormData>(() => {
    if (typeof window === 'undefined') {
      return initialData || defaultFormData;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }

    return initialData || defaultFormData;
  });

  // Save to localStorage whenever form data changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const updateField = (field: keyof PostFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearForm = () => {
    setFormData(defaultFormData);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    formData,
    updateField,
    clearForm,
  };
} 