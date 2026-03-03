import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Eye, Search, Filter,
  Folder, Image, Video, Archive, Code,
  Calendar, User, MoreVertical, RefreshCw
} from 'lucide-react';
import { studentApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './StudentFiles.css';

const StudentFiles = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentApi.getFiles();
      
      let filesData = [];
      let foldersData = [];
      
      if (response.data?.data) {
        // Handle different possible structures
        if (Array.isArray(response.data.data.files)) {
          filesData = response.data.data.files;
          foldersData = response.data.data.folders || [];
        } else if (Array.isArray(response.data.data)) {
          filesData = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        filesData = response.data;
      } else if (response.data?.files && Array.isArray(response.data.files)) {
        filesData = response.data.files;
        foldersData = response.data.folders || [];
      }
      
      setFiles(filesData);
      setFolders(foldersData);
      
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return <FileText className="file-icon pdf" />;
    if (type?.includes('doc')) return <FileText className="file-icon doc" />;
    if (type?.includes('jpg') || type?.includes('png')) return <Image className="file-icon image" />;
    if (type?.includes('mp4')) return <Video className="file-icon video" />;
    if (type?.includes('zip')) return <Archive className="file-icon archive" />;
    if (type?.includes('js') || type?.includes('py')) return <Code className="file-icon code" />;
    return <FileText className="file-icon" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    return file.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredFolders = folders.filter(folder => {
    return folder.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
    <div className="student-files">
      <div className="page-header">
        <div>
          <h1>Academic Files</h1>
          <p>Access course materials, assignments, and resources</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <Folder size={18} />
            <span>{folders.length} Folders</span>
          </div>
          <div className="stat-badge">
            <FileText size={18} />
            <span>{files.length} Files</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={fetchFiles} className="retry-btn">Retry</button>
        </div>
      )}

      <Card className="files-card">
        <div className="files-header">
          <h2>File Repository</h2>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchFiles}>
            Refresh
          </Button>
        </div>

        <div className="files-controls">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="controls-group">
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <div className="grid-icon">⊞</div>
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <div className="list-icon">☰</div>
              </button>
            </div>
            <Button variant="outline" size="sm" icon={Filter}>Filter</Button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="breadcrumb">
          <span className="breadcrumb-item active">My Files</span>
          {currentPath !== '/' && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item">{currentPath}</span>
            </>
          )}
        </div>

        {files.length === 0 && folders.length === 0 ? (
          <div className="empty-state">
            <Folder size={64} />
            <h3>No files available</h3>
            <p>Course materials and resources will appear here when uploaded by your instructors.</p>
          </div>
        ) : (
          <>
            {/* Folders Section */}
            {filteredFolders.length > 0 && (
              <div className="folders-section">
                <div className="section-header">
                  <h3>Folders</h3>
                  <span className="section-badge">{filteredFolders.length} folders</span>
                </div>
                <div className={viewMode === 'grid' ? 'folders-grid' : 'folders-list'}>
                  {filteredFolders.map(folder => (
                    <div 
                      key={folder.id} 
                      className="folder-item"
                      onClick={() => setCurrentPath(folder.path || folder.name)}
                    >
                      <Folder size={viewMode === 'grid' ? 32 : 20} className="folder-icon" />
                      <div className="folder-info">
                        <span className="folder-name">{folder.name}</span>
                        {viewMode === 'list' && (
                          <span className="folder-meta">{folder.fileCount || 0} items</span>
                        )}
                      </div>
                      {viewMode === 'grid' && (
                        <span className="folder-count">{folder.fileCount || 0} items</span>
                      )}
                      {viewMode === 'list' && (
                        <div className="folder-actions">
                          <button className="action-btn" title="Open">
                            <Eye size={16} />
                          </button>
                          <button className="action-btn" title="More">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {filteredFiles.length > 0 && (
              <div className="files-section">
                <div className="section-header">
                  <h3>Files</h3>
                  <span className="section-badge">{filteredFiles.length} files</span>
                </div>
                
                {viewMode === 'grid' ? (
                  <div className="files-grid">
                    {filteredFiles.map(file => (
                      <div key={file.id} className="file-item">
                        <div className="file-icon-large">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="file-info">
                          <span className="file-name" title={file.name}>
                            {file.name?.length > 25 ? file.name.substring(0, 25) + '...' : file.name}
                          </span>
                          <div className="file-meta">
                            <span className="file-size">{formatFileSize(file.size)}</span>
                            <span className="file-modified">{file.modified || 'Recently'}</span>
                          </div>
                          <span className="file-owner">
                            <User size={12} />
                            {file.uploadedBy || 'Instructor'}
                          </span>
                        </div>
                        <div className="file-actions">
                          <button className="action-btn" title="Download">
                            <Download size={16} />
                          </button>
                          <button className="action-btn" title="Preview">
                            <Eye size={16} />
                          </button>
                          <button className="action-btn" title="More">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="files-list">
                    <div className="list-header">
                      <div className="col-name">Name</div>
                      <div className="col-size">Size</div>
                      <div className="col-modified">Modified</div>
                      <div className="col-owner">Owner</div>
                      <div className="col-actions">Actions</div>
                    </div>
                    <div className="list-body">
                      {filteredFiles.map(file => (
                        <div key={file.id} className="list-row">
                          <div className="col-name">
                            {getFileIcon(file.type)}
                            <span className="file-name-text" title={file.name}>
                              {file.name}
                            </span>
                          </div>
                          <div className="col-size">{formatFileSize(file.size)}</div>
                          <div className="col-modified">{file.modified || 'Recently'}</div>
                          <div className="col-owner">{file.uploadedBy || 'Instructor'}</div>
                          <div className="col-actions">
                            <button className="action-btn" title="Download">
                              <Download size={16} />
                            </button>
                            <button className="action-btn" title="Preview">
                              <Eye size={16} />
                            </button>
                            <button className="action-btn" title="More">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Storage Info */}
        <div className="storage-info">
          <div className="storage-header">
            <span>Storage Used</span>
            <span>2.4 GB / 10 GB</span>
          </div>
          <div className="storage-bar">
            <div className="storage-used" style={{ width: '24%' }}></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentFiles;