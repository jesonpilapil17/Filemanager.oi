import React from 'react';
import { useParams } from 'react-router-dom';

const FileView: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">File View</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          File ID: {fileId}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          File preview functionality will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default FileView;