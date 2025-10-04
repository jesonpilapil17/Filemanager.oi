import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface File {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  updatedAt: string;
}

interface FileListProps {
  currentFolder: string | null;
  viewMode?: 'grid' | 'list';
}

const FileList: React.FC<FileListProps> = ({ currentFolder, viewMode = 'grid' }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data - would be replaced with actual API call
    const mockFiles: File[] = [
      { id: 'folder1', name: 'Documents', type: 'folder', updatedAt: '2023-08-15T10:30:00Z' },
      { id: 'folder2', name: 'Images', type: 'folder', updatedAt: '2023-08-14T15:45:00Z' },
      { id: 'folder3', name: 'Videos', type: 'folder', updatedAt: '2023-08-13T16:20:00Z' },
      { id: 'file1', name: 'Report.pdf', type: 'file', size: 2500000, mimeType: 'application/pdf', updatedAt: '2023-08-13T09:20:00Z' },
      { id: 'file2', name: 'Presentation.pptx', type: 'file', size: 5800000, mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', updatedAt: '2023-08-12T14:10:00Z' },
      { id: 'file3', name: 'Profile.jpg', type: 'file', size: 1200000, mimeType: 'image/jpeg', updatedAt: '2023-08-11T11:05:00Z' },
      { id: 'file4', name: 'Budget.xlsx', type: 'file', size: 850000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', updatedAt: '2023-08-10T13:30:00Z' },
      { id: 'file5', name: 'Notes.txt', type: 'file', size: 15000, mimeType: 'text/plain', updatedAt: '2023-08-09T08:45:00Z' },
    ];
    
    setFiles(mockFiles);
    setLoading(false);
  }, [currentFolder]);

  const handleItemClick = (item: File) => {
    if (item.type === 'folder') {
      navigate(`/?folder=${item.id}`);
    } else {
      navigate(`/file/${item.id}`);
    }
  };

  const handleItemSelect = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'folder') {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      );
    }

    const mimeType = file.mimeType || '';
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }

    if (mimeType === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }

    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
        <p className="text-lg font-medium">This folder is empty</p>
        <p className="text-sm">Upload files or create folders to get started</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 hidden sm:block">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-4">Modified</div>
          </div>
        </div>

        {/* File List */}
        <div className="divide-y divide-gray-200">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => handleItemClick(file)}
              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedItems.includes(file.id) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-12 sm:col-span-6 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(file.id)}
                    onChange={(e) => handleItemSelect(e as any, file.id)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="mr-3">{getFileIcon(file)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 sm:hidden">
                      {file.size ? formatFileSize(file.size) : ''} • {formatDate(file.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 hidden sm:block">
                  <p className="text-sm text-gray-900">
                    {file.size ? formatFileSize(file.size) : '—'}
                  </p>
                </div>
                <div className="col-span-4 hidden sm:block">
                  <p className="text-sm text-gray-900">{formatDate(file.updatedAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => handleItemClick(file)}
            className={`group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-200 ${
              selectedItems.includes(file.id) ? 'ring-2 ring-blue-500 border-blue-500' : ''
            }`}
          >
            {/* Selection checkbox */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <input
                type="checkbox"
                checked={selectedItems.includes(file.id)}
                onChange={(e) => handleItemSelect(e as any, file.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {/* File icon */}
            <div className="flex justify-center mb-3">
              {getFileIcon(file)}
            </div>

            {/* File info */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 truncate mb-1" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {file.size ? formatFileSize(file.size) : ''}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(file.updatedAt)}
              </p>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;