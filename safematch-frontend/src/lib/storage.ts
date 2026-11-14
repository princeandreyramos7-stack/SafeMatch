import axios from './axios';

/**
 * Get the full URL for a storage file
 * @param path - The storage path from the database (e.g., "profile_pictures/abc.jpg")
 * @returns Full URL to the storage file
 */
export function getStorageUrl(path: string | null | undefined): string {
  if (!path) return '';
  
  // Remove /api from the baseURL to get the server base
  const baseURL = axios.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000';
  
  // Ensure path doesn't start with slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${baseURL}/storage/${cleanPath}`;
}
