import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Upload, CheckCircle } from 'lucide-react';
import styles from './EditImageModal.module.css';

const BACKEND_URL = API_BASE_URL;

export default function EditImageModal({ isOpen, asset, onClose, onSuccess }) {
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (asset) {
      setImageUrl(asset.imageData || '');
      setPreviewUrl(asset.imageData || '');
      setError('');
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setImageUrl(val);
    setPreviewUrl(val);
    setError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large (max 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
      setPreviewUrl(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError('Please provide an image URL or upload a photo.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('ce_token');
      const res = await fetch(`${BACKEND_URL}/api/assets/${asset.id}/image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageData: imageUrl })
      });

      if (res.ok) {
        const updated = await res.json();
        onSuccess(updated);
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to update image. Admin permissions required.');
      }
    } catch {
      setError('Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>

        <div className={styles.header}>
          <ImageIcon size={28} className={styles.icon} />
          <div>
            <h3 className={styles.title}>Update Asset Photo</h3>
            <p className={styles.subtitle}>{asset.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Live Preview */}
          <div className={styles.previewContainer}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className={styles.previewImg}
                onError={() => setError('Image failed to load. Please check the URL.')}
              />
            ) : (
              <div className={styles.noPreview}>
                <ImageIcon size={48} />
                <span>No image selected</span>
              </div>
            )}
          </div>

          {/* URL Input */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Image Web URL (Unsplash, Imgur, etc.)</label>
            <input
              type="url"
              className={styles.input}
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl.startsWith('data:') ? '' : imageUrl}
              onChange={handleUrlChange}
            />
          </div>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          {/* File Upload */}
          <div className={styles.uploadGroup}>
            <label className={styles.uploadBtn}>
              <Upload size={16} />
              <span>Choose Image From Computer</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              <CheckCircle size={16} />
              {loading ? 'Saving...' : 'Save New Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
