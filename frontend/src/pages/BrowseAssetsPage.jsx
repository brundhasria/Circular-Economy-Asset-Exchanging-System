import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, DollarSign, Recycle, Gift, MapPin, Search, Image as ImageIcon, X, CheckCircle, Phone, Mail, Home, Camera, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import EditImageModal from '../components/EditImageModal';
import styles from './BrowseAssetsPage.module.css';

const BACKEND_URL = API_BASE_URL;
const CATEGORIES = ['All Categories', 'Electronics', 'Furniture', 'Books', 'Bicycle', 'Home Appliance', 'Clothing', 'Others'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const LISTING_TYPES = ['All Types', 'Exchange', 'Sell', 'Recycle', 'Donate'];

export default function BrowseAssetsPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [activeListingType, setActiveListingType] = useState('All Types');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [sortOrder, setSortOrder] = useState('latest');
  const [user, setUser] = useState(() => localStorage.getItem('ce_username'));
  const [role, setRole] = useState(() => localStorage.getItem('ce_role'));
  const [actingId, setActingId] = useState(null);
  const [toast, setToast] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [editingAssetImage, setEditingAssetImage] = useState(null);

  const fetchAssets = () => {
    fetch(`${BACKEND_URL}/api/assets`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const availableOnly = data.filter(a => a.status === 'Available' || !a.status);
          setAssets(availableOnly);
          setFiltered(availableOnly);
        }
      })
      .catch(() => console.error('Backend not reachable.'));
  };

  useEffect(() => {
    fetchAssets();
    setRole(localStorage.getItem('ce_role'));
    const success = localStorage.getItem('ce_listing_success');
    if (success === 'true') {
      showToast('Listing created successfully!');
      localStorage.removeItem('ce_listing_success');
    }
  }, []);

  useEffect(() => {
    let result = [...assets];
    if (activeCategory !== 'All Categories') result = result.filter(a => a.type === activeCategory);
    if (activeListingType !== 'All Types') result = result.filter(a => a.listingType === activeListingType);
    if (selectedConditions.length > 0) result = result.filter(a => selectedConditions.includes(a.assetCondition));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q)
      );
    }
    if (sortOrder === 'latest') result = result.sort((a, b) => b.id - a.id);
    else result = result.sort((a, b) => a.id - b.id);
    setFiltered(result);
  }, [assets, activeCategory, activeListingType, selectedConditions, searchQuery, sortOrder]);

  const toggleCondition = (c) => {
    setSelectedConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const executeAction = async () => {
    if (!user || !selectedAsset || !confirmAction) return;
    setActingId(selectedAsset.id);
    const endpoint = confirmAction === 'recycle' ? 'recycle' : 'exchange';
    try {
      const token = localStorage.getItem('ce_token');
      const res = await fetch(`${BACKEND_URL}/api/assets/${selectedAsset.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedAsset = await res.json();
        setSuccessData({ ...updatedAsset, actionTaken: confirmAction });
        setConfirmAction(null);
        setSelectedAsset(null);
        fetchAssets();
      } else if (res.status === 409) {
        showToast('This asset is no longer available.');
        setConfirmAction(null); setSelectedAsset(null); fetchAssets();
      } else if (res.status === 404) {
        showToast('Asset not found.');
        setConfirmAction(null); setSelectedAsset(null);
      } else {
        showToast('Something went wrong. Please try again.');
      }
    } catch {
      showToast('Could not reach backend.');
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async (assetId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      const token = localStorage.getItem('ce_token');
      const delRes = await fetch(`${BACKEND_URL}/api/assets/${assetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (delRes.ok) {
        showToast('Asset deleted successfully');
        fetchAssets();
      } else {
        showToast('Failed to delete asset');
      }
    } catch {
      showToast('Error contacting server');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem('ce_token');
    localStorage.removeItem('ce_username');
    localStorage.removeItem('ce_role');
    setUser(null);
    setRole(null);
  };

  const getActionDetails = (asset) => {
    switch (asset.listingType) {
      case 'Sell': return { icon: <DollarSign size={14} />, text: 'Buy Now', color: '#1565c0' };
      case 'Recycle': return { icon: <Recycle size={14} />, text: 'Pickup', color: '#e65100' };
      case 'Donate': return { icon: <Gift size={14} />, text: 'Claim', color: '#6a1b9a' };
      default: return { icon: <ArrowLeftRight size={14} />, text: 'Exchange', color: '#0a7338' };
    }
  };

  return (
    <div className={styles.page}>
      <Navbar variant="dark" user={user} onLogout={handleLogout} onAssetAdded={fetchAssets} />

      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Confirmation Modal */}
      {confirmAction && selectedAsset && (
        <div className={styles.modalOverlay} onClick={() => setConfirmAction(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {confirmAction === 'recycle' ? 'Recycle this asset?' : 'Exchange this asset?'}
            </h3>
            <div className={styles.confirmBox}>
              <p>You are requesting:</p>
              <h4>{selectedAsset.title}</h4>
              <p>Condition: {selectedAsset.assetCondition}</p>
              {selectedAsset.estimatedValue && <p>Estimated Value: ₹{selectedAsset.estimatedValue}</p>}
            </div>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmAction(null)} disabled={actingId}>Cancel</button>
              <button
                className={confirmAction === 'recycle' ? styles.recycleActionBtn : styles.claimActionBtn}
                onClick={executeAction}
                disabled={actingId}
              >
                {actingId ? 'Processing...' : (confirmAction === 'recycle' ? 'Confirm Recycle' : 'Confirm Exchange')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successData && (
        <div className={styles.modalOverlay} onClick={() => setSuccessData(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setSuccessData(null)}><X size={20} /></button>
            <div className={styles.successIconWrapper}><CheckCircle size={48} className={styles.checkIcon} /></div>
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
                  <div className={styles.detailRow}><Phone size={16} /><span>{successData.contactPhone}</span></div>
                )}
                {successData.contactEmail && (
                  <div className={styles.detailRow}><Mail size={16} /><span>{successData.contactEmail}</span></div>
                )}
                {successData.address && (
                  <div className={styles.detailRow}><Home size={16} /><span className={styles.addressText}>{successData.address}</span></div>
                )}
              </div>
            </div>
            <button className={styles.closeSuccessBtn} onClick={() => setSuccessData(null)}>Got It</button>
          </div>
        </div>
      )}

      {/* Admin Edit Image Modal */}
      <EditImageModal
        isOpen={!!editingAssetImage}
        asset={editingAssetImage}
        onClose={() => setEditingAssetImage(null)}
        onSuccess={(updated) => {
          showToast('📸 Asset photo updated successfully!');
          fetchAssets();
        }}
      />

      <div className={styles.searchBarContainer}>
        <div className={`container ${styles.searchInner}`}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              placeholder="Search assets (e.g. chair, laptop, bike...)"
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search className={styles.searchIcon} size={20} />
          </div>
          <div className={styles.listingTypeTabs}>
            {LISTING_TYPES.map(type => (
              <button
                key={type}
                className={`${styles.tabBtn} ${activeListingType === type ? styles.activeTab : ''}`}
                onClick={() => setActiveListingType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Categories</h3>
            <ul className={styles.categoryList}>
              {CATEGORIES.map(cat => (
                <li
                  key={cat}
                  className={activeCategory === cat ? styles.activeCategory : ''}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Condition</h3>
            <div className={styles.filterGroup}>
              {CONDITIONS.map(c => (
                <label key={c} className={styles.checkboxLabel}>
                  <input type="checkbox" checked={selectedConditions.includes(c)} onChange={() => toggleCondition(c)} /> {c}
                </label>
              ))}
            </div>
          </div>
          <button
            className={styles.btnApply}
            onClick={() => { setActiveCategory('All Categories'); setActiveListingType('All Types'); setSelectedConditions([]); setSearchQuery(''); }}
          >
            Reset Filters
          </button>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.pageTitle}>Browse Assets</h2>
              <p className={styles.pageSubtitle}>Find items you need and connect with others.</p>
            </div>
          </div>

          <div className={styles.resultsMeta}>
            <span><strong>{filtered.length}</strong> Assets Found</span>
            <div className={styles.sortWrapper}>
              <span>Sort By: </span>
              <select className={styles.inlineSelect} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <ImageIcon size={60} />
              <p>No assets found. Try adjusting your filters or list the first one!</p>
            </div>
          ) : (
            <div className={styles.assetGrid}>
              {filtered.map(asset => {
                const action = getActionDetails(asset);
                const isAvailable = asset.status === 'Available';
                return (
                  <div key={asset.id} className={styles.assetCard} onClick={() => setSelectedAsset(asset)}>
                    <div className={styles.cardImage}>
                      {asset.imageData ? (
                        <img src={asset.imageData} alt={asset.title} className={styles.assetImg} />
                      ) : (
                        <div className={styles.noImage}><ImageIcon size={36} /></div>
                      )}
                      
                      {/* Status / Type Badges */}
                      <div className={styles.badgesWrapper}>
                        <span className={`${styles.statusBadge} ${isAvailable ? styles.badgeAvailable : styles.badgeExchanged}`}>
                          {asset.status}
                        </span>
                        <span className={styles.typeBadge} style={{ backgroundColor: action.color }}>
                          {asset.listingType}
                        </span>
                      </div>

                      {/* Admin Quick Edit Button on Image */}
                      {role === 'ADMIN' && (
                        <button
                          className={styles.adminImageEditBtn}
                          title="Change Asset Photo"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAssetImage(asset);
                          }}
                        >
                          <Camera size={14} /> Change Photo
                        </button>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <span className={styles.assetCategory}>{asset.type}</span>
                      <h4 className={styles.assetTitle}>{asset.title}</h4>
                      <p className={styles.assetCondition}>{asset.assetCondition}</p>
                      <div className={styles.assetLocation}>
                        <MapPin size={13} />
                        <span>{asset.location}</span>
                      </div>
                      <div className={styles.detailsSection}>
                        {asset.estimatedValue && (
                          <p className={styles.assetValue}>
                            {asset.listingType === 'Sell' ? 'Price:' : 'Est. Value:'} ₹{asset.estimatedValue?.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className={styles.cardFooter}>
                        <div className={styles.userMeta}>
                          <div className={styles.userAvatar}>
                            {asset.listedBy ? asset.listedBy[0].toUpperCase() : 'U'}
                          </div>
                          <span>{asset.listedBy || 'User'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            className={styles.exchangeBtn}
                            style={{ backgroundColor: isAvailable ? action.color : '#ccc' }}
                            disabled={!isAvailable}
                            onClick={(e) => { e.stopPropagation(); navigate(`/asset/${asset.id}`); }}
                          >
                            {action.icon}
                            View Details
                          </button>
                          {role === 'ADMIN' && (
                            <button
                              className={styles.exchangeBtn}
                              style={{ backgroundColor: '#b71c1c', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={(e) => handleDelete(asset.id, e)}
                              disabled={actingId === asset.id}
                              title="Delete Asset"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
