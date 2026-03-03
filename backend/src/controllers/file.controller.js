import prisma from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const getFiles = async (req, res) => {
  try {
    const { path: currentPath = '/', search } = req.query;
    
    const folders = await prisma.folder.findMany({
      where: {
        path: currentPath
      },
      include: {
        _count: {
          select: { files: true }
        }
      }
    });

    const files = await prisma.file.findMany({
      where: {
        folder: currentPath === '/' ? null : {
          path: currentPath
        },
        ...(search && {
          name: { contains: search, mode: 'insensitive' }
        })
      },
      include: {
        uploadedBy: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalSize = await prisma.file.aggregate({
      _sum: { size: true }
    });

    const formattedFolders = folders.map(f => ({
      id: f.id,
      name: f.name,
      fileCount: f._count.files,
      size: '0',
      icon: 'folder',
      path: f.path,
      createdAt: f.createdAt
    }));

    const formattedFiles = files.map(f => ({
      id: f.id,
      name: f.name,
      type: f.extension,
      size: (f.size / (1024 * 1024)).toFixed(1),
      sizeUnit: 'MB',
      modified: formatRelativeTime(f.updatedAt),
      owner: f.uploadedBy.name,
      icon: getFileIcon(f.extension),
      path: f.path,
      downloads: f.downloads
    }));

    const usedGB = (totalSize._sum.size || 0) / (1024 * 1024 * 1024);
    const totalGB = 100;

    res.json({
      success: true,
      data: {
        folders: formattedFolders,
        files: formattedFiles,
        storage: {
          used: usedGB.toFixed(1),
          total: totalGB,
          percentage: Math.min(100, Math.round((usedGB / totalGB) * 100))
        }
      }
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { folderId, courseId, description, isPublic } = req.body;
    const file = req.file;

    const savedFile = await prisma.file.create({
      data: {
        name: file.originalname,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        type: file.mimetype,
        extension: path.extname(file.originalname).slice(1),
        folderId: folderId || null,
        courseId: courseId || null,
        description,
        isPublic: isPublic === 'true',
        uploadedById: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: savedFile
    });

  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await prisma.file.findUnique({
      where: { id }
    });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    await prisma.file.update({
      where: { id },
      data: { downloads: { increment: 1 } }
    });

    res.download(file.path, file.originalName);

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await prisma.file.findUnique({
      where: { id }
    });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await prisma.file.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFolder = async (req, res) => {
  try {
    const { name, parentId, courseId, isPublic } = req.body;
    
    const parent = parentId ? await prisma.folder.findUnique({
      where: { id: parentId }
    }) : null;

    const folderPath = parent ? path.join(parent.path, name) : `/${name}`;

    const folder = await prisma.folder.create({
      data: {
        name,
        path: folderPath,
        parentId: parentId || null,
        courseId: courseId || null,
        isPublic: isPublic === 'true',
        createdById: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: folder
    });

  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, folderId, isPublic } = req.body;
    
    const file = await prisma.file.findUnique({
      where: { id }
    });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const updated = await prisma.file.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        folderId: folderId || undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined
      }
    });

    res.json({
      success: true,
      message: 'File updated successfully',
      data: updated
    });

  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId, isPublic } = req.body;
    
    const folder = await prisma.folder.findUnique({
      where: { id }
    });

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    const parent = parentId ? await prisma.folder.findUnique({
      where: { id: parentId }
    }) : null;

    const folderPath = parent ? path.join(parent.path, name || folder.name) : `/${name || folder.name}`;

    const updated = await prisma.folder.update({
      where: { id },
      data: {
        name: name || undefined,
        path: folderPath,
        parentId: parentId || undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined
      }
    });

    res.json({
      success: true,
      message: 'Folder updated successfully',
      data: updated
    });

  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        files: true,
        children: true
      }
    });

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    if (folder.files.length > 0 || folder.children.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Folder is not empty. Delete files and subfolders first.' 
      });
    }

    await prisma.folder.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Folder deleted successfully'
    });

  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFolderContents = async (req, res) => {
  try {
    const { id } = req.params;
    
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        files: {
          include: {
            uploadedBy: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        children: {
          include: {
            _count: {
              select: { files: true }
            }
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    const formattedFiles = folder.files.map(f => ({
      id: f.id,
      name: f.name,
      type: f.extension,
      size: (f.size / (1024 * 1024)).toFixed(1),
      sizeUnit: 'MB',
      modified: formatRelativeTime(f.updatedAt),
      owner: f.uploadedBy.name,
      icon: getFileIcon(f.extension)
    }));

    const formattedSubfolders = folder.children.map(c => ({
      id: c.id,
      name: c.name,
      fileCount: c._count.files,
      icon: 'folder'
    }));

    res.json({
      success: true,
      data: {
        folder: {
          id: folder.id,
          name: folder.name,
          path: folder.path,
          isPublic: folder.isPublic
        },
        subfolders: formattedSubfolders,
        files: formattedFiles
      }
    });

  } catch (error) {
    console.error('Get folder contents error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStorageStats = async (req, res) => {
  try {
    const totalSize = await prisma.file.aggregate({
      _sum: { size: true }
    });

    const fileCount = await prisma.file.count();
    const folderCount = await prisma.folder.count();

    const usedGB = (totalSize._sum.size || 0) / (1024 * 1024 * 1024);
    const totalGB = 100;

    res.json({
      success: true,
      data: {
        used: usedGB.toFixed(1),
        total: totalGB,
        percentage: Math.min(100, Math.round((usedGB / totalGB) * 100)),
        fileCount,
        folderCount
      }
    });

  } catch (error) {
    console.error('Get storage stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

const getFileIcon = (extension) => {
  const icons = {
    pdf: 'file-text',
    doc: 'file-text',
    docx: 'file-text',
    xls: 'file-text',
    xlsx: 'file-text',
    ppt: 'file-text',
    pptx: 'file-text',
    txt: 'file-text',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    mp4: 'video',
    mov: 'video',
    avi: 'video',
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive',
    js: 'code',
    ts: 'code',
    html: 'code',
    css: 'code',
    json: 'code'
  };
  return icons[extension] || 'file';
};