import React, { useState } from 'react';

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface FolderBreadcrumbProps {
  path: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

const FolderBreadcrumb: React.FC<FolderBreadcrumbProps> = ({ path, onNavigate }) => {
  const [showFullPath, setShowFullPath] = useState(false);

  // For mobile, show only the last 2 items unless expanded
  const getVisiblePath = () => {
    if (showFullPath || path.length <= 2) {
      return path;
    }
    return path.slice(-2);
  };

  const hasHiddenItems = path.length > 2 && !showFullPath;

  return (
    <nav className="flex items-center text-sm text-gray-600 mb-4 min-w-0">
      <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
        {/* Home Button */}
        <button
          onClick={() => onNavigate(null)}
          className="flex items-center hover:text-blue-600 transition-colors duration-200 hover:bg-blue-50 rounded px-2 py-1 flex-shrink-0"
          title="Go to Home"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
          <span className="hidden sm:inline">Home</span>
        </button>

        {/* Show ellipsis if there are hidden items */}
        {hasHiddenItems && (
          <>
            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <button
              onClick={() => setShowFullPath(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-50 rounded px-2 py-1 flex-shrink-0"
              title="Show full path"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </>
        )}

        {/* Breadcrumb Items */}
        {getVisiblePath().map((item, index) => {
          const isLast = index === getVisiblePath().length - 1;
          
          return (
            <React.Fragment key={item.id}>
              <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <button
                onClick={() => onNavigate(item.id)}
                className={`transition-all duration-200 hover:bg-blue-50 rounded px-2 py-1 truncate max-w-32 sm:max-w-48 ${
                  isLast 
                    ? 'text-gray-900 font-medium hover:text-blue-700' 
                    : 'hover:text-blue-600'
                }`}
                title={item.name}
              >
                <span className="truncate">{item.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Collapse button for mobile when full path is shown */}
      {showFullPath && path.length > 2 && (
        <button
          onClick={() => setShowFullPath(false)}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-50 rounded p-1 flex-shrink-0"
          title="Collapse path"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </nav>
  );
};

export default FolderBreadcrumb;