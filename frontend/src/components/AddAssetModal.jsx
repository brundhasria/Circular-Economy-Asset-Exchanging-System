import React, { useState } from 'react';
import { X, Upload, ArrowLeftRight, DollarSign, Recycle, Gift, Sparkles, PenTool } from 'lucide-react';
import styles from './AddAssetModal.module.css';

const LISTING_TYPES = [
  { value: 'Exchange', icon: ArrowLeftRight, color: '#0a7338', label: 'Exchange' },
  { value: 'Sell', icon: DollarSign, color: '#1565c0', label: 'Sell' },
  { value: 'Recycle', icon: Recycle, color: '#e65100', label: 'Recycle' },
  { value: 'Donate', icon: Gift, color: '#6a1b9a', label: 'Donate' },
];

export default function AddAssetModal({ isOpen, onClose, user }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Electronics',
    assetCondition: 'Good',
    location: '',
    estimatedValue: '',
    listingType: 'Exchange',
    address: '',
    contactPhone: '',
    contactEmail: '',
    imageData: '',
    description: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValuing, setIsValuing] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');
  const [isDescribing, setIsDescribing] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData({ ...formData, imageData: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const getAiValuation = async () => {
    if (!formData.title || !formData.location) {
      alert('Please fill in the title and location first!');
      return;
    }
    setIsValuing(true);
    setAiReasoning('');
    try {
      const response = await fetch('http://localhost:8081/api/ai/valuate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          condition: formData.assetCondition,
          location: formData.location
        })
      });
      const data = await response.json();
      setFormData(prev => ({ ...prev, estimatedValue: data.estimatedValue }));
      setAiReasoning(data.reasoning);
    } catch (error) {
      console.error('AI Error:', error);
      setAiReasoning('AI is currently busy. Please set a manual price.');
    } finally {
      setIsValuing(false);
    }
  };

  const generateAiDescription = async () => {
    if (!formData.title) {
      alert('Please enter a title first!');
      return;
    }
    setIsDescribing(true);
    try {
      const response = await fetch('http://localhost:8081/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          condition: formData.assetCondition
        })
      });
      const data = await response.json();
      setFormData(prev => ({ ...prev, description: data.description }));
    } catch (error) {
      console.error('AI Error:', error);
      alert('AI description failed. Please write it manually.');
    } finally {
      setIsDescribing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('ce_token');
      const payload = { ...formData, listedBy: user || 'Anonymous' };
      if (payload.estimatedValue === '') {
        payload.estimatedValue = null;
      } else {
        payload.estimatedValue = parseFloat(payload.estimatedValue);
      }

      const res = await fetch('http://localhost:8081/api/assets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      setFormData({
        title: '', type: 'Electronics', assetCondition: 'Good', location: '',
        estimatedValue: '', listingType: 'Exchange', address: '',
        contactPhone: '', contactEmail: '', imageData: '', description: ''
      });
      setImagePreview(null);
      setAiReasoning('');
      localStorage.setItem('ce_listing_success', 'true');
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.message && error.message.includes('401')) {
        alert('Session expired. Please log out and log back in, then try again.');
      } else {
        alert('Could not save asset. Is the backend running?');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPrice = formData.listingType === 'Sell' || formData.listingType === 'Exchange';

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>List a New Asset</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Listing Type Selector */}
          <div className={styles.listingTypeSection}>
            <label className={styles.sectionLabel}>What do you want to do?</label>
            <div className={styles.listingTypeGrid}>
              {LISTING_TYPES.map(lt => {
                const Icon = lt.icon;
                const isActive = formData.listingType === lt.value;
                return (
                  <button
                    key={lt.value}
                    type="button"
                    className={`${styles.listingTypeCard} ${isActive ? styles.listingTypeActive : ''}`}
                    style={isActive ? { borderColor: lt.color, backgroundColor: lt.color + '10' } : {}}
                    onClick={() => setFormData({ ...formData, listingType: lt.value })}
                  >
                    <Icon size={22} style={{ color: lt.color }} />
                    <span>{lt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload */}
          <div className={styles.imageUploadArea}>
            <label htmlFor="imageUpload" className={styles.imageLabel}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <Upload size={28} />
                  <p>Upload asset photo</p>
                  <span>JPG, PNG under 2MB</span>
                </div>
              )}
            </label>
            <input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} className={styles.hiddenInput} />
            {imagePreview && (
              <button type="button" className={styles.removeImage}
                onClick={() => { setImagePreview(null); setFormData({ ...formData, imageData: '' }); }}>
                Remove
              </button>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label>Asset Title</label>
            <input type="text" name="title" placeholder="e.g. Dell XPS Laptop 2022" value={formData.title} onChange={handleChange} required />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Category</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Books</option>
                <option>Bicycle</option>
                <option>Home Appliance</option>
                <option>Clothing</option>
                <option>Others</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Condition</label>
              <select name="assetCondition" value={formData.assetCondition} onChange={handleChange}>
                <option>New</option>
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>
              Description
              <button type="button" onClick={generateAiDescription} className={styles.aiTextBtn} disabled={isDescribing}>
                <PenTool size={14} /> {isDescribing ? 'Writing...' : 'Auto-Write'}
              </button>
            </label>
            <textarea name="description" placeholder="Describe the asset..." value={formData.description} onChange={handleChange} rows={3} className={styles.textarea} />
          </div>

          <div className={styles.inputGroup}>
            <label>City / Area</label>
            <input type="text" name="location" placeholder="e.g. Coimbatore, Tamil Nadu" value={formData.location} onChange={handleChange} required />
          </div>

          <div className={styles.inputGroup}>
            <label>{formData.listingType === 'Recycle' ? 'Pickup Address' : 'Exchange / Pickup Address'}</label>
            <textarea name="address" placeholder="Full address for pickup or exchange" value={formData.address} onChange={handleChange} rows={2} className={styles.textarea} required />
          </div>

          {/* Contact Details */}
          <div className={styles.contactSection}>
            <label className={styles.sectionLabel}>Contact Details (visible to interested users)</label>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Phone</label>
                <input type="tel" name="contactPhone" placeholder="e.g. 9876543210" value={formData.contactPhone} onChange={handleChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input type="email" name="contactEmail" placeholder="e.g. you@email.com" value={formData.contactEmail} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Price section — only for Sell and Exchange */}
          {showPrice && (
            <div className={styles.valuationSection}>
              <div className={styles.inputGroup}>
                <label>{formData.listingType === 'Sell' ? 'Selling Price (₹)' : 'Estimated Value (₹)'}</label>
                <div className={styles.valueInputWrapper}>
                  <span className={styles.currency}>₹</span>
                  <input
                    type="number"
                    name="estimatedValue"
                    placeholder="0"
                    value={formData.estimatedValue}
                    onChange={handleChange}
                    className={styles.valueInput}
                    required
                  />
                </div>
              </div>
              <button type="button" onClick={getAiValuation} className={styles.aiBtn} disabled={isValuing}>
                <Sparkles size={18} />
                {isValuing ? 'Analyzing...' : '✨ AI Value'}
              </button>
            </div>
          )}

          {aiReasoning && (
            <div className={styles.aiReasoningBox}>
              <strong>✨ AI Insight:</strong> {aiReasoning}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Listing...' : `List for ${formData.listingType}`}
          </button>
        </form>
      </div>
    </div>
  );
}
