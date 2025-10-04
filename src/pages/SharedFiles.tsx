import React from 'react';

const SharedFiles: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shared Files</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Your shared files and folders will appear here.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This page will show all files and folders you've shared with others.
        </p>
      </div>
    </div>
  );
};

export default SharedFiles;