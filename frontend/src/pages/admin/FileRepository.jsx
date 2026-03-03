import React, { useState, useEffect } from 'react';
import { 
  Folder, File, Upload, Download, Trash2, Share2,
  Search, Filter, Grid, List, Plus,
  Image, FileText, Video, Archive,
  Users, ChevronLeft, ChevronRight,
  HardDrive, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './FileRepository.css';

const FileRepository = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // View state
  const [viewMode, setViewMode] = useState('grid');
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [folderName, setFolderName] = useState('');
  
  // Storage stats
  const [storageStats, setStorageStats] = useState({
    used: 0,
    total: 100,
    percentage: 0
  });

  useEffect(() => {
    fetchFiles();
  }, [currentPath, searchTerm]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        path: currentPath,
        search: searchTerm || undefined
      };
      
      const response = await adminApi.getFiles(params);
      
      if (response.data?.success && response.data?.data) {
        setFiles(response.data.data.files || []);
        setFolders(response.data.data.folders || []);
        setStorageStats(response.data.data.storage || {
          used: 0,
          total: 100,
          percentage: 0
        });
      } else {
        setFiles([]);
        setFolders([]);
      }
      
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError(err.response?.data?.message || 'Failed to load files');
      setFiles([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    
    try {
      const formData = {
        file: uploadFile,
        folderId: null,
        description: '',
        isPublic: false
      };
      
      await adminApi.uploadFile(formData);
      setShowUploadModal(false);
      setUploadFile(null);
      fetchFiles();
    } catch (err) {
      console.error('Failed to upload file:', err);
      alert('Failed to upload file: ' + err.message);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    
    try {
      await adminApi.createFolder({
        name: folderName,
        parentId: null,
        isPublic: false
      });
      setShowFolderModal(false);
      setFolderName('');
      fetchFiles();
    } catch (err) {
      console.error('Failed to create folder:', err);
      alert('Failed to create folder: ' + err.message);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      if (type === 'file') {
        await adminApi.deleteFile(id);
      } else {
        await adminApi.deleteFolder(id);
      }
      fetchFiles();
    } catch (err) {
      console.error(`Failed to delete ${type}:`, err);
      alert(`Failed to delete ${type}`);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await adminApi.downloadFile(file.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download file:', err);
      alert('Failed to download file');
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentPath(folder.path);
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText size={20} className="file-icon pdf" />;
      case 'doc': return <FileText size={20} className="file-icon doc" />;
      case 'docx': return <FileText size={20} className="file-icon doc" />;
      case 'xlsx': return <FileText size={20} className="file-icon xls" />;
      case 'jpg': return <Image size={20} className="file-icon image" />;
      case 'png': return <Image size={20} className="file-icon image" />;
      case 'mp4': return <Video size={20} className="file-icon video" />;
      case 'zip': return <Archive size={20} className="file-icon archive" />;
      default: return <File size={20} className="file-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-repository">
      <div className="page-header">
        <div>
          <h1>File Repository</h1>
          <p>Manage all academic files and documents</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchFiles}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" icon={Upload} onClick={() => setShowUploadModal(true)}>
            Upload
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowFolderModal(true)}>
            New Folder
          </Button>
        </div>
      </div>

      <Card className="storage-card">
        <div className="storage-info">
          <HardDrive size={20} />
          <span>{storageStats.used} GB of {storageStats.total} GB used</span>
        </div>
        <div className="storage-bar">
          <div className="storage-fill" style={{ width: `${storageStats.percentage}%` }}></div>
        </div>
        <span className="storage-percentage">{storageStats.percentage}%</span>
      </Card>

      <div className="file-controls">
        <div className="path-breadcrumb">
          <button className="path-item" onClick={() => setCurrentPath('/')}>Root</button>
          {currentPath !== '/' && (
            <>
              <ChevronRight size={16} />
              <span className="path-item current">{currentPath}</span>
            </>
          )}
        </div>

        <div className="view-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={18} />
          </button>
          <button 
            className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </button>
          <Button variant="outline" size="sm" icon={Filter}>
            Filter
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      {folders.length === 0 && files.length === 0 ? (
        <div className="empty-state">
          <Folder size={64} />
          <h3>No files or folders found</h3>
          <p>Get started by creating a folder or uploading a file</p>
          <div className="empty-actions">
            <Button variant="primary" icon={Plus} onClick={() => setShowFolderModal(true)}>
              New Folder
            </Button>
            <Button variant="outline" icon={Upload} onClick={() => setShowUploadModal(true)}>
              Upload File
            </Button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="file-grid">
          {/* Folders Section */}
          {folders.length > 0 && (
            <div className="folders-section">
              <h3>Folders</h3>
              <div className="folder-grid">
                {folders.map(folder => (
                  <Card key={folder.id} className="folder-card" onClick={() => handleFolderClick(folder)}>
                    <div className="folder-icon">
                      <Folder size={32} />
                    </div>
                    <div className="folder-info">
                      <h4>{folder.name}</h4>
                      <p>{folder.fileCount} files</p>
                    </div>
                    <button 
                      className="folder-menu"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(folder.id, 'folder');
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {files.length > 0 && (
            <div className="files-section">
              <h3>Files</h3>
              <div className="files-grid">
                {files.map(file => (
                  <Card key={file.id} className="file-card">
                    <div className="file-icon">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="file-info">
                      <h4>{file.name}</h4>
                      <p>{file.size} {file.sizeUnit} • {file.modified}</p>
                      <div className="file-owner">
                        <Users size={12} />
                        <span>{file.owner}</span>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button className="file-action" onClick={() => handleDownload(file)}>
                        <Download size={14} />
                      </button>
                      <button className="file-action" onClick={() => handleDelete(file.id, 'file')}>
                        <Trash2 size={14} />
                      </button>
                      <button className="file-action">
                        <Share2 size={14} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="file-list">
          <table className="files-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Modified</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {folders.map(folder => (
                <tr key={folder.id} className="folder-row" onClick={() => handleFolderClick(folder)}>
                  <td>
                    <div className="file-name-cell">
                      <Folder size={16} />
                      <span>{folder.name}</span>
                    </div>
                  </td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>
                    <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="table-action" onClick={() => handleDelete(folder.id, 'folder')}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {files.map(file => (
                <tr key={file.id}>
                  <td>
                    <div className="file-name-cell">
                      {getFileIcon(file.type)}
                      <span>{file.name}</span>
                    </div>
                  </td>
                  <td>{file.size} {file.sizeUnit}</td>
                  <td>{file.modified}</td>
                  <td>{file.owner}</td>
                  <td>
                    <div className="table-actions">
                      <button className="table-action" onClick={() => handleDownload(file)}>
                        <Download size={14} />
                      </button>
                      <button className="table-action" onClick={() => handleDelete(file.id, 'file')}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadFile(null);
        }}
        title="Upload File"
        size="md"
      >
        <form onSubmit={handleUpload} className="upload-form">
          <div className="form-group">
            <label>Select File</label>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files[0])}
              required
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Upload
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Folder Modal */}
      <Modal
        isOpen={showFolderModal}
        onClose={() => {
          setShowFolderModal(false);
          setFolderName('');
        }}
        title="Create Folder"
        size="md"
      >
        <form onSubmit={handleCreateFolder} className="folder-form">
          <div className="form-group">
            <label>Folder Name</label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., Course Materials"
              required
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowFolderModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FileRepository;