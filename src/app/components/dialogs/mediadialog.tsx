// components/MediaDialog.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/lib/components/web/react/ui/dialog';
import { Button } from '@/lib/components/web/react/ui/button';
import { X, File, Image, Video, FileText, Upload, Loader2, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Media from '@/core/models/domain/Media';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  uploadedUrl?: string;
  serverFileName?: string;
}

interface MediaDialogProps {
  isOpen: boolean;
  reservationId: string;
  customerId: string;
  initialMedia?: Media[];
  onMediaSaved: (reservationId: string, customerId: string, uploadedFiles: Media[]) => void;
  onOpenChanged: () => void;
  title?: string;
  description?: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export default function MediaDialog({
  isOpen,
  reservationId,
  customerId,
  initialMedia = [],
  onMediaSaved,
  onOpenChanged,
  title = 'Upload Media',
  description = 'Upload images, videos, or documents',
  maxFileSize = 10 * 1024 * 1024,
  allowedFileTypes = ['image/*', 'video/*', 'application/pdf', 'text/plain'],
}: MediaDialogProps) {
  const [existingMedia, setExistingMedia] = useState<Media[]>(initialMedia);
  const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  useEffect(() => {
    if (isOpen) {
      setExistingMedia(initialMedia);
      setUploadQueue([]);
      abortControllers.current.clear();
    }
  }, [isOpen, initialMedia]);

  const getFileExtension = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(lastDotIndex).toLowerCase() : '';
  };

  const getFileIcon = (fileName: string, size: string = "w-12 h-12") => {
    const extension = getFileExtension(fileName);
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].includes(extension)) {
      return <Image key={fileName} href={fileName} className={`${size} text-blue-500`} />;
    } else if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(extension)) {
      return <Video key={fileName} href={fileName} className={`${size} text-purple-500`} />;
    } else if (['.pdf'].includes(extension)) {
      return <FileText key={fileName} className={`${size} text-red-500`} />;
    } else if (['.doc', '.docx'].includes(extension)) {
      return <FileText key={fileName} className={`${size} text-blue-600`} />;
    } else if (['.txt'].includes(extension)) {
      return <FileText key={fileName} className={`${size} text-gray-500`} />;
    }
    return <File className={`${size} text-gray-400`} />;
  };

  const getFileThumbnail = (fileName: string, size: string = "w-12 h-12") => {
    const extension = getFileExtension(fileName);
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].includes(extension)) {
      return <img key={fileName} src={fileName} className={`${size} text-blue-500`} />;
    } 
    return getFileIcon(fileName, size);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newUploads: UploadFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: 'pending',
    }));
    setUploadQueue(prev => [...prev, ...newUploads]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadSingleFile = async (uploadItem: UploadFile): Promise<Media | null> => {
    const controller = new AbortController();
    abortControllers.current.set(uploadItem.id, controller);

    setUploadQueue(prev => prev.map(item =>
      item.id === uploadItem.id ? { ...item, status: 'uploading', progress: 0 } : item
    ));

    const formData = new FormData();
    formData.append('file', uploadItem.file);
    formData.append('reservationId', reservationId);
    formData.append('customerId', customerId);

    try {
      const xhr = new XMLHttpRequest();
      
      const promise = new Promise<{id: string, fileName: string}>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadQueue(prev => prev.map(item =>
              item.id === uploadItem.id ? { ...item, progress } : item
            ));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve({
                id: response.id,
                fileName: response.url
              });
            } catch (error) {
              reject(new Error('Invalid server response'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.onabort = () => reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', '/api/medias');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send(formData);

      const result = await promise;
      
      setUploadQueue(prev => prev.map(item =>
        item.id === uploadItem.id ? {
          ...item,
          status: 'completed',
          progress: 100,
          serverFileId: result.id,
          serverFileName: result.fileName
        } : item
      ));

      return { ...new Media(), id: result.id, url: result.fileName, reservationId, customerId };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setUploadQueue(prev => prev.map(item =>
          item.id === uploadItem.id ? { ...item, status: 'cancelled' } : item
        ));
      } else {
        console.error('Upload error:', error);
        setUploadQueue(prev => prev.map(item =>
          item.id === uploadItem.id ? { ...item, status: 'error' } : item
        ));
      }
      return null;
    } finally {
      abortControllers.current.delete(uploadItem.id);
    }
  };

  const handleUploadAll = async () => {
    setIsSubmitting(true);
    const pendingUploads = uploadQueue.filter(item => item.status === 'pending');
    const uploadPromises = pendingUploads.map(uploadSingleFile);

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((item): item is Media => item !== null);

      if (successfulUploads.length > 0) {
        setExistingMedia(prev => [...prev, ...successfulUploads]);
      }

      setUploadQueue(prev => prev.filter(item => item.status !== 'completed'));
      if(onMediaSaved) onMediaSaved(reservationId, customerId, [...existingMedia, ...successfulUploads]);

    } catch (error) {
      console.error('Error during batch upload:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelUpload = (uploadId: string) => {
    const controller = abortControllers.current.get(uploadId);
    if (controller) {
      controller.abort();
    }
    setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
  };

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/medias/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      const filterList = existingMedia.filter(m => m.id !== fileId);
      setExistingMedia(filterList);
      if(onMediaSaved) onMediaSaved(reservationId, customerId, [...filterList]);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleSave = async () => {
    if (uploadQueue.some(item => item.status === 'uploading' || item.status === 'pending')) {
      await handleUploadAll();
    }
    onMediaSaved(reservationId, customerId, existingMedia);
    onOpenChanged();
  };

  const handleCancel = () => {
    abortControllers.current.forEach(controller => controller.abort());
    setUploadQueue([]);
    setExistingMedia(initialMedia);
    onOpenChanged();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChanged}>
      <DialogContent className="flex flex-col min-w-[70vw] h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description} (Reservation: {reservationId}, Customer: {customerId})
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-6 py-4 overflow-hidden">
          {/* Uploaded Files Section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Uploaded Files</h3>
            <div className="grid grid-cols-8 gap-3 min-h-[10vh] max-h-[20vh] overflow-scroll p-2">
              {existingMedia.length > 0 ? (
                existingMedia.map((media) => {
                  const extension = getFileExtension(media.url);
                  const fileUrl = `${media.url}`;

                  return (
                    <div key={media.id} className="relative group">
                      <a
                        href={`/api/public/files?fileUrl=${encodeURIComponent(fileUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="w-22 h-22 flex items-center justify-center">
                          {getFileThumbnail(`/api/public/files?fileUrl=${encodeURIComponent(media.url)}`, "w-20 h-20")}
                        </div>
                        <span className="text-xs text-gray-600">
                          {extension || 'file'}
                        </span>
                      </a>
                      <button
                        onClick={() => deleteFile(media.id)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete file"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-8 text-center text-gray-500 py-8">
                  No files uploaded yet.
                </div>
              )}
            </div>
          </div>

          {/* Upload Queue Section */}
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="text-sm font-medium">Upload Queue</h3>
            <div className="space-y-2 flex-1 min-h-[10vh] max-h-[20vh] overflow-scroll p-2 border rounded-md">
              {uploadQueue.length > 0 ? (
                uploadQueue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 flex items-center justify-center">
                        {getFileIcon(item.file.name, "w-6 h-6")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.file.name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-y-auto">
                      {item.status === 'pending' && (
                        <span className="text-xs text-gray-500">Pending</span>
                      )}
                      
                      {item.status === 'uploading' && (
                        <>
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                          <button
                            onClick={() => handleCancelUpload(item.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Cancel upload"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {item.status === 'completed' && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                      
                      {item.status === 'error' && (
                        <span className="text-xs text-red-500">Error</span>
                      )}
                      
                      {item.status === 'cancelled' && (
                        <span className="text-xs text-gray-500">Cancelled</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No files in queue.</div>
              )}
            </div>
          </div>

          {/* File Input Control */}
          <div className="border-t pt-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept={allowedFileTypes.join(',')}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
            >
              <Upload className="mr-2 h-4 w-4" /> Select Files
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Max size: {maxFileSize / (1024 * 1024)}MB. Allowed: {allowedFileTypes.join(', ')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Close
          </Button>
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleUploadAll}
            disabled={isSubmitting || uploadQueue.length === 0}
          >
            {isSubmitting ? 'Uploading...' : 'Upload All'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}