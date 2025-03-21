import axios from 'axios';
import type { AxiosError } from 'node_modules/axios';
import type { ApiError } from '../types/api';

// Create an Axios instance with default config
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling utility
export async function handleApiError(error: unknown): Promise<ApiError> {
  const axiosError = error as AxiosError;
  if (axiosError.isAxiosError) {
    return {
      message: axiosError.response?.data?.message || axiosError.message,
      status: axiosError.response?.status,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unexpected error occurred',
  };
} 