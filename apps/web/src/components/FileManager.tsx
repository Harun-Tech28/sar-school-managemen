import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileUploader } from './FileUploader';
import {
  listFiles,
  deleteFile,
  getPublicUrl,
  formatFileSize,
  type StorageBucket
} from '@sar-school/shared';

interface FileItem {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

interface FileManagerProps {
  bucket: StorageBucket;
  folder?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  onFileSelect?: (file: FileItem) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  accept?: string;
}

export const FileManager: React.FC<FileManagerProps> = ({
  bucket,
  folder = '',
  allowUpload = true,
  allowDelete = true,
  onFileSelect,
  maxSizeMB = 10,
  allowedTypes = [],
  accept
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  useEffect(() => {
    loadFiles();
  }, [bucket, folder]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await listFiles(supabase, bucket, folder);

      if (result.error) {
        throw new Error(result.error);
      }

      setFiles(result.files as FileItem[]);
    } catch (err: any) {
      console.error('Error loading files:', err);
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async () => {
    setShowUploader(false);
    await loadFiles();
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      const result = await deleteFile(supabase, bucket, filePath);

      if (result.error) {
        throw new Error(result.error);
      }

      await loadFiles();
    } catch (err: any) {
      console.error('Error deleting file:', err);
      alert(err.message || 'Failed to delete file');
    }
  };

  const handleDownload = (fileName: string) => {
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    const url = getPublicUrl(supabase, bucket, filePath);
    window.open(url, '_blank');
  };

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return '🖼️';
    } else if (mimetype === 'application/pdf') {
      return '📄';
    } else if (mimetype.includes('word')) {
      return '📝';
    } else if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) {
      return '📊';
    } else if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) {
      return '📽️';
    }
    return '📎';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadFiles}
          className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Files {folder && `in ${folder}`}
        </h3>
        {allowUpload && (
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showUploader ? 'Cancel Upload' : 'Upload File'}
          </button>
        )}
      </div>

      {/* File Uploader */}
      {showUploader && allowUpload && (
        <div className="bg-gray-50 rounded-lg p-4">
          <FileUploader
            bucket={bucket}
            path={folder ? `${folder}/${Date.now()}_` : `${Date.now()}_`}
            maxSizeMB={maxSizeMB}
            allowedTypes={allowedTypes}
            accept={accept}
            onUploadComplete={handleUploadComplete}
            onError={(err) => alert(err)}
          />
        </div>
      )}

      {/* Files List */}
      {files.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No files found</p>
          {allowUpload && (
            <button
              onClick={() => setShowUploader(true)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700"
            >
              Upload your first file
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr
                  key={file.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedFile?.id === file.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleFileClick(file)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {getFileIcon(file.metadata?.mimetype || '')}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file.metadata?.mimetype || 'Unknown type'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(file.metadata?.size || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(file.updated_at || file.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file.name);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Download
                    </button>
                    {allowDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file.name);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* File Preview (if selected) */}
      {selectedFile && selectedFile.metadata?.mimetype?.startsWith('image/') && (
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Preview</h4>
          <img
            src={getPublicUrl(
              supabase,
              bucket,
              folder ? `${folder}/${selectedFile.name}` : selectedFile.name
            )}
            alt={selectedFile.name}
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
};
