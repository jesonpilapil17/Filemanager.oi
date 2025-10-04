import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  getProfile: () => api.get('/auth/profile'),
};

// Files API
export const filesAPI = {
  getFiles: (folderId?: string) =>
    api.get('/files', { params: { folderId } }),
  
  getFile: (id: string) => api.get(`/files/${id}`),
  
  uploadFile: (formData: FormData, onProgress?: (progress: number) => void) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }),
  
  deleteFile: (id: string) => api.delete(`/files/${id}`),
  
  downloadFile: (id: string) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
};

// Folders API
export const foldersAPI = {
  getFolders: (parentFolderId?: string) =>
    api.get('/folders', { params: { parentFolderId } }),
  
  getFolderContents: (folderId: string) =>
    api.get(`/folders/${folderId}/contents`),
  
  createFolder: (data: { name: string; parentFolderId?: string }) =>
    api.post('/folders', data),
  
  renameFolder: (id: string, name: string) =>
    api.patch(`/folders/${id}`, { name }),
  
  deleteFolder: (id: string) => api.delete(`/folders/${id}`),
};

// Shares API
export const sharesAPI = {
  createShare: (data: {
    fileId?: string;
    folderId?: string;
    type?: string;
    password?: string;
    expiresAt?: string;
    maxUses?: number;
  }) => api.post('/shares', data),
  
  getShares: () => api.get('/shares'),
  
  getSharedContent: (shareKey: string, password?: string) =>
    api.get(`/shares/${shareKey}`, { params: { password } }),
  
  deleteShare: (shareKey: string) => api.delete(`/shares/${shareKey}`),
};

export default api;