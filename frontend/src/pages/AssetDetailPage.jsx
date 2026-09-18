import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { X, ImageIcon, User, MapPin, Recycle, ArrowLeftRight, CheckCircle, Phone, Mail, Home, ArrowLeft, Camera } from 'lucide-react';
import EditImageModal from '../components/EditImageModal';
import styles from './BrowseAssetsPage.module.css'; // Reusing browse page styles for modals and cards

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => localStorage.getItem('ce_username'));
  const [role, setRole] = useState(() => localStorage.getItem('ce_role'));
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [editingImage, setEditingImage] = useState(false);
  
  const [confirmAction, setConfirmAction] = useState(null); // 'exchange' or 'recycle'
  const [successData, setSuccessData] = useState(null);
  const [actingId, setActingId] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchAssetDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets`);
      if (res.ok) {
        const data = await res.json();
        const found = data.find(a => a.id === Number(id));
        if (found) {
          setAsset(found);
        } else {
          showToast('❌ Asset not found.');
        }
      } else {
        showToast('❌ Failed to fetch asset details.');
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('ce_token');
    localStorage.removeItem('ce_username');
    setUser(null);
  };

  const initiateAction = (actionType) => {
    if (!user) { 
      showToast('Please login to continue!'); 
      return; 
    }
    setConfirmAction(actionType);
  };

  const executeAction = async () => {
    if (!user || !asset || !confirmAction) return;
    
    setActingId(asset.id);
    const endpoint = confirmAction === 'recycle' ? 'recycle' : 'exchange';
    
    try {
      const token = localStorage.getItem('ce_token');
      const res = await fetch(`${API_BASE_URL}/api/assets/${asset.id}/${endpoint}`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const updatedAsset = await res.json();
        setSuccessData({ ...updatedAsset, actionTaken: confirmAction });
        setConfirmAction(null);
        setAsset(updatedAsset); // Update page state with new status/owner info
      } else if (res.status === 409) {
        showToast('❌ This asset is no longer available.');
        setConfirmAction(null);
        fetchAssetDetails(); // Refresh details
      } else if (res.status === 404) {
        showToast('❌ Asset not found.');
        setConfirmAction(null);
      } else {
        const errorData = await res.json();
        showToast(`❌ ${errorData.error || errorData.message || 'Action failed.'}`);
        setConfirmAction(null);
      }
    } catch (err) {
      showToast('❌ Network error. Please try again.');
      setConfirmAction(null);
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar variant="light" user={user} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.25rem' }}>
          Loading asset details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!asset) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar variant="light" user={user} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Asset not found or not available.</p>
          <Link to="/browse" style={{ textDecoration: 'none', color: '#0a7338', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowLeft size={16} /> Back to Browse
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar variant="light" user={user} onLogout={handleLogout} />

      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className={styles.modalOverlay} onClick={() => setConfirmAction(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {confirmAction === 'recycle' ? 'Recycle this asset?' :
               asset.listingType === 'Sell' ? 'Buy this asset?' :
               asset.listingType === 'Donate' ? 'Claim this item for free?' :
               asset.listingType === 'Recycle' ? 'Schedule a pickup?' :
               'Exchange this asset?'}
            </h3>
            <div className={styles.confirmBox}>
              <p>You are requesting:</p>
              <h4>{asset.title}</h4>
              <p>Condition: {asset.assetCondition}</p>
              {asset.estimatedValue && <p>{asset.listingType === 'Sell' ? 'Price' : 'Estimated Value'}: ₹{asset.estimatedValue}</p>}
            </div>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmAction(null)} disabled={actingId}>
                Cancel
              </button>
              <button 
                className={confirmAction === 'recycle' ? styles.recycleActionBtn : styles.claimActionBtn} 
                onClick={executeAction}
                disabled={actingId}
              >
                {actingId ? 'Processing...' : (
                  confirmAction === 'recycle' ? 'Confirm Recycle' :
                  asset.listingType === 'Sell' ? 'Confirm Purchase' :
                  asset.listingType === 'Donate' ? 'Confirm Claim' :
                  asset.listingType === 'Recycle' ? 'Confirm Pickup' :
                  'Confirm Exchange'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successData && (
        <div className={styles.modalOverlay} onClick={() => setSuccessData(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setSuccessData(null)}>
              <X size={20} />
            </button>
            <div className={styles.successIconWrapper}>
              <CheckCircle size={48} className={styles.checkIcon} />
            </div>
            <h3 className={styles.modalTitle}>Listing Secured!</h3>
            <p className={styles.modalSubtitle}>
              You have successfully initiated this transaction. Please use the owner's details below to finalize pick-up or exchange details.
            </p>

            <div className={styles.ownerDetailsCard}>
              <div className={styles.ownerAvatarBig}>
                {successData.listedBy ? successData.listedBy[0].toUpperCase() : 'U'}
              </div>
              <h4 className={styles.ownerName}>{successData.listedBy || 'Anonymous'}</h4>
              <span className={styles.ownerRole}>Asset Owner</span>

              <div className={styles.detailsList}>
                {successData.contactPhone && (
                  <div className={styles.detailRow}>
                    <Phone size={16} />
                    <span>{successData.contactPhone}</span>
                  </div>
                )}
                {successData.contactEmail && (
                  <div className={styles.detailRow}>
                    <Mail size={16} />
                    <span>{successData.contactEmail}</span>
                  </div>
                )}
                {successData.address && (
                  <div className={styles.detailRow}>
                    <Home size={16} />
                    <span className={styles.addressText}>{successData.address}</span>
                  </div>
                )}
              </div>
            </div>

            <button className={styles.closeSuccessBtn} onClick={() => setSuccessData(null)}>
              Got It
            </button>
          </div>
        </div>
      )}

      <main style={{ flex: 1, padding: '2.5rem 1.5rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/browse" style={{ textDecoration: 'none', color: '#666', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.95rem' }}>
            <ArrowLeft size={16} /> Back to Browse
          </Link>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div className={styles.detailsSplit}>
            <div className={styles.detailsImageSide} style={{ position: 'relative' }}>
              {asset.imageData ? (
                <img src={asset.imageData} alt={asset.title} className={styles.detailsImg} />
              ) : (
                <div className={styles.noDetailsImage}><ImageIcon size={64} /></div>
              )}
              {role === 'ADMIN' && (
                <button
                  className={styles.adminImageEditBtn}
                  onClick={() => setEditingImage(true)}
                  title="Change Asset Photo"
                  style={{ top: '15px', right: '15px' }}
                >
                  <Camera size={14} /> Change Photo
                </button>
              )}
            </div>

            <EditImageModal
              isOpen={editingImage}
              asset={asset}
              onClose={() => setEditingImage(false)}
              onSuccess={(updated) => {
                setAsset(updated);
                showToast('📸 Asset photo updated successfully!');
              }}
            />
            
            <div className={styles.detailsInfoSide}>
              <span className={styles.assetCategory}>{asset.type}</span>
              <h2 className={styles.detailsTitle} style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{asset.title}</h2>
              <div className={styles.detailsMeta} style={{ marginBottom: '1rem' }}>
                <span>Condition: <strong>{asset.assetCondition}</strong></span>
                <span>|</span>
                <span>Status: <strong className={styles.badgeAvailable}>{asset.status}</strong></span>
              </div>
              
              <div className={styles.detailsSectionBox}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Description</h4>
                <p style={{ margin: 0, color: '#555', lineHeight: 1.5 }}>{asset.description || 'No description provided.'}</p>
              </div>

              <div className={styles.detailsSectionBox}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>AI Estimated Value</h4>
                <p className={styles.aiValueText} style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0a7338' }}>
                  ₹{asset.estimatedValue?.toLocaleString()}
                </p>
              </div>

              <div className={styles.detailsSectionBox}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Listing Owner</h4>
                <p className={styles.ownerText} style={{ margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#555' }}>
                  <User size={14}/> {asset.listedBy}
                </p>
                <p className={styles.locationText} style={{ margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#777', fontSize: '0.9rem' }}>
                  <MapPin size={14}/> {asset.location}
                </p>
              </div>

              <div className={styles.detailsActions} style={{ marginTop: '1.5rem' }}>
                {asset.status !== 'Available' ? (
                  <button className={styles.claimActionBtn} style={{ backgroundColor: '#aaa', cursor: 'not-allowed' }} disabled>
                    Secured / Claimed
                  </button>
                ) : user === asset.listedBy ? (
                  <button className={styles.recycleActionBtn} onClick={() => initiateAction('recycle')} style={{ width: '100%', padding: '0.8rem' }}>
                    <Recycle size={18} /> Recycle Asset
                  </button>
                ) : asset.listingType === 'Sell' ? (
                  <button className={styles.claimActionBtn} onClick={() => initiateAction('exchange')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#1565c0' }}>
                    <span>💳</span> Buy Now
                  </button>
                ) : asset.listingType === 'Donate' ? (
                  <button className={styles.claimActionBtn} onClick={() => initiateAction('exchange')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#6a1b9a' }}>
                    <span>🎁</span> Claim for Free
                  </button>
                ) : asset.listingType === 'Recycle' ? (
                  <button className={styles.claimActionBtn} onClick={() => initiateAction('exchange')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#e65100' }}>
                    <Recycle size={18} /> Schedule Pickup
                  </button>
                ) : (
                  <button className={styles.claimActionBtn} onClick={() => initiateAction('exchange')} style={{ width: '100%', padding: '0.8rem' }}>
                    <ArrowLeftRight size={18} /> Claim / Exchange
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
