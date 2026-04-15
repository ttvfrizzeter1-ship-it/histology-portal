import React, { useState, useRef } from 'react';
import api from '../api/client';

const TYPE_ICONS = {
  'image/': '🖼️',
  'application/pdf': '📄',
  'application/vnd.ms-powerpoint': '📊',
  'application/vnd.openxmlformats-officedocument.presentationml': '📊',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml': '📝',
  'video/': '🎬',
};

function getIcon(mime = '') {
  for (const [k, v] of Object.entries(TYPE_ICONS)) {
    if (mime.startsWith(k)) return v;
  }
  return '📎';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * FileUpload component
 * Props:
 *   value       - current URL string
 *   onChange    - called with new URL string
 *   accept      - file input accept string (default: all supported)
 *   label       - field label
 *   placeholder - URL input placeholder
 */
export default function FileUpload({ value, onChange, accept, label = 'Файл', placeholder = 'https://...' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const inputRef = useRef();

  const defaultAccept = '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm';

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.url);
      setFileInfo({ name: data.filename, size: data.size, mime: data.mimetype });
    } catch (e) {
      setError(e.response?.data?.error || 'Помилка завантаження');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const isUploaded = value && value.startsWith('/uploads/');
  const isUrl = value && !value.startsWith('/uploads/');

  return (
    <div className="space-y-2">
      {label && <label className="block text-gray-400 text-sm font-medium">{label}</label>}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed border-white/10 hover:border-yellow-400/40 rounded-xl p-5 cursor-pointer transition-all group hover:bg-yellow-400/3"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept || defaultAccept}
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />

        {uploading ? (
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin"/>
            <span className="text-sm">Завантаження...</span>
          </div>
        ) : isUploaded && fileInfo ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getIcon(fileInfo.mime)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{fileInfo.name}</div>
              <div className="text-gray-500 text-xs">{formatSize(fileInfo.size)} · Завантажено ✓</div>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(''); setFileInfo(null); }}
              className="text-gray-600 hover:text-red-400 text-xl transition-colors"
            >×</button>
          </div>
        ) : isUploaded ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">📎</span>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm truncate">{value.split('/').pop()}</div>
              <div className="text-gray-500 text-xs">Файл збережено</div>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(''); }}
              className="text-gray-600 hover:text-red-400 text-xl transition-colors"
            >×</button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-3xl group-hover:scale-110 transition-transform">📁</div>
            <div className="text-gray-400 text-sm">
              <span className="text-yellow-400 font-medium">Клікніть</span> або перетягніть файл
            </div>
            <div className="text-gray-600 text-xs">PDF, Word, PowerPoint, зображення, відео · до 50MB</div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-400 text-xs flex items-center gap-1.5">
          <span>⚠</span>{error}
        </div>
      )}

      {/* OR: manual URL input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/5"/>
        <span className="text-gray-600 text-xs">або введіть URL</span>
        <div className="flex-1 h-px bg-white/5"/>
      </div>

      <input
        type="text"
        value={isUrl ? value : ''}
        onChange={e => { setFileInfo(null); onChange(e.target.value); }}
        placeholder={placeholder}
        className="input-dark w-full px-4 py-2.5 rounded-lg text-sm"
      />

      {/* Preview for images */}
      {value && (isUploaded || isUrl) && (
        (() => {
          const isImage = fileInfo?.mime?.startsWith('image/') ||
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value);
          if (!isImage) return null;
          return (
            <div className="mt-1">
              <img
                src={value}
                alt="preview"
                className="h-24 rounded-lg object-cover border border-white/10"
                onError={e => e.target.style.display = 'none'}
              />
            </div>
          );
        })()
      )}
    </div>
  );
}
