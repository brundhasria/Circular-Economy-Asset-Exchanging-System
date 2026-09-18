import { API_BASE_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MessageSquare, ShoppingBag, LayoutList, User, Send, ArrowLeftRight, DollarSign, Gift, Recycle, X, Trophy, Medal, Sparkles } from 'lucide-react';
import SmartMatch from '../components/SmartMatch';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const [user, setUser] = useState(() => localStorage.getItem('ce_username'));
  const [listedAssets, setListedAssets] = useState([]);
  const [purchasedAssets, setPurchasedAssets] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('listings'); // listings | purchases | leaderboard
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    const success = localStorage.getItem('ce_listing_success');
    if (success === 'true') {
      showToast('🎉 Listing created successfully!');
      localStorage.removeItem('ce_listing_success');
    }
  }, []);
  
  // Chat state
  const [activeChatAsset, setActiveChatAsset] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);
  const chatInterval = useRef(null);

  const fetchDashboardData = () => {
    if (!user) return;
    
    // Fetch all assets and filter client-side
    fetch(`${API_BASE_URL}/api/assets`)
      .then(res => res.json())
      .then(data => {
        const listed = data.filter(a => a.listedBy === user);
        const purchased = data.filter(a => a.acquiredBy === user);
        setListedAssets(listed);
        setPurchasedAssets(purchased);
      })
      .catch(err => console.error("Error fetching dashboard assets:", err));

    fetch(`${API_BASE_URL}/api/assets/leaderboard`)
      .then(res => res.json())
      .then(data => setLeaderboard(data))
      .catch(err => console.error("Error fetching leaderboard:", err));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Handle chat polling
  useEffect(() => {
    if (activeChatAsset) {
      fetchChatMessages();
      chatInterval.current = setInterval(fetchChatMessages, 2500);
    } else {
      clearInterval(chatInterval.current);
    }
    return () => clearInterval(chatInterval.current);
  }, [activeChatAsset]);

  // Scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchChatMessages = () => {
    if (!activeChatAsset) return;
    fetch(`${API_BASE_URL}/api/chat/${activeChatAsset.id}`)
      .then(res => res.json())
      .then(data => setChatMessages(data))
      .catch(err => console.error("Error fetching chat messages:", err));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatAsset) return;

    const recipient = user === activeChatAsset.listedBy ? activeChatAsset.acquiredBy : activeChatAsset.listedBy;

    const messageData = {
      assetId: activeChatAsset.id,
      sender: user,
      recipient: recipient,
      message: newMessage
    };

    fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    })
      .then(res => res.json())
      .then(() => {
        setNewMessage('');
        fetchChatMessages();
      })
      .catch(err => console.error("Error sending message:", err));
  };

  const startChat = (asset) => {
    setActiveChatAsset(asset);
  };

  const handleLogout = () => {
    localStorage.removeItem('ce_token');
    localStorage.removeItem('ce_username');
    localStorage.removeItem('ce_role');
    setUser(null);
  };

  const getListingIcon = (type) => {
    switch (type) {
      case 'Sell': return <DollarSign size={16} style={{ color: '#1565c0' }} />;
      case 'Recycle': return <Recycle size={16} style={{ color: '#e65100' }} />;
      case 'Donate': return <Gift size={16} style={{ color: '#6a1b9a' }} />;
      default: return <ArrowLeftRight size={16} style={{ color: '#0a7338' }} />;
    }
  };

  if (!user) {
    return (
      <div className={styles.page}>
        <Navbar variant="dark" user={user} onLogout={handleLogout} />
        <div className={`container ${styles.authAlert}`}>
          <div className={styles.authAlertCard}>
            <User size={64} className={styles.alertIcon} />
            <h2>Access Restricted</h2>
            <p>Please login or create an account to view your products, purchases, and chat with customers.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar variant="dark" user={user} onLogout={handleLogout} />

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#222',
          color: 'white',
          padding: '0.9rem 2rem',
          borderRadius: '30px',
          zIndex: 9999,
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toast}
        </div>
      )}

      <div className={`container ${styles.layout}`}>
        {/* Profile/Stats Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.avatarBig}>{user[0].toUpperCase()}</div>
            <h3>{user}</h3>
            <span className={styles.badgeEco}>🌱 Circular Citizen</span>

            <div className={styles.statsList}>
              <div className={styles.statRow}>
                <span>Items Listed:</span>
                <strong>{listedAssets.length}</strong>
              </div>
              <div className={styles.statRow}>
                <span>Items Acquired:</span>
                <strong>{purchasedAssets.length}</strong>
              </div>
              <div className={styles.statRow}>
                <span>Carbon Saved:</span>
                <strong className={styles.greenText}>{(listedAssets.length * 8.4).toFixed(1)} kg CO₂</strong>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          <div className={styles.tabsHeader}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'listings' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('listings')}
            >
              <LayoutList size={18} /> My Listings ({listedAssets.length})
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'purchases' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('purchases')}
            >
              <ShoppingBag size={18} /> My Purchases ({purchasedAssets.length})
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <Recycle size={18} /> Exchange History
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'leaderboard' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <Trophy size={18} /> Leaderboard
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'smartmatch' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('smartmatch')}
            >
              <Sparkles size={18} /> Smart Match
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'leaderboard' ? (
              <div className={styles.leaderboardContainer}>
                <h2>Community Eco-Warriors</h2>
                <p>🌱 Eco-Points are earned by reusing, exchanging, and recycling assets.</p>
                <div className={styles.leaderboardList}>
                  {leaderboard.length === 0 ? <p>No data yet.</p> : leaderboard.map((lb, index) => (
                    <div key={lb.username} className={styles.leaderboardCard}>
                      <div className={styles.lbRank}>#{index + 1}</div>
                      <div className={styles.lbInfo}>
                        <h4>{lb.username} {index === 0 && <Medal size={16} color="#fbbf24" />}</h4>
                        <span className={styles.badgeEco}>{lb.badge}</span>
                      </div>
                      <div className={styles.lbPoints}>
                        <strong>{lb.points}</strong> pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'smartmatch' ? (
              <SmartMatch />
            ) : activeTab === 'history' ? (
              <div className={styles.historyContainer}>
                <h2>Exchange History</h2>
                <div className={styles.historyTableWrapper}>
                  <table className={styles.historyTable}>
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Category</th>
                        <th>Value</th>
                        <th>Status</th>
                        <th>Eco-Points</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listedAssets.concat(purchasedAssets)
                        .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i) // unique
                        .filter(a => a.status === 'Exchanged' || a.status === 'Recycled' || a.status === 'Sold')
                        .map(asset => (
                        <tr key={asset.id}>
                          <td><strong>{asset.title}</strong></td>
                          <td>{asset.type}</td>
                          <td>₹{asset.estimatedValue?.toLocaleString()}</td>
                          <td>
                            <span className={styles.statusDone}>{asset.status}</span>
                          </td>
                          <td className={styles.pointsCell}>
                            {asset.listedBy === user && asset.ecoPointsAwarded ? `+${asset.ecoPointsAwarded}` : '-'}
                          </td>
                          <td>{asset.transactionDate || 'Today'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'listings' ? (
              listedAssets.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>You haven't listed any products yet. Put up your first asset to help reduce landfill waste!</p>
                </div>
              ) : (
                <div className={styles.assetList}>
                  {listedAssets.map(asset => (
                    <div key={asset.id} className={styles.dashboardCard}>
                      <div className={styles.cardImage}>
                        {asset.imageData ? (
                          <img src={asset.imageData} alt={asset.title} />
                        ) : (
                          <div className={styles.noImg}>📷</div>
                        )}
                      </div>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardHeader}>
                          <span className={styles.typeBadge}>
                            {getListingIcon(asset.listingType)}
                            {asset.listingType}
                          </span>
                          <span className={`${styles.statusLabel} ${asset.status === 'Available' ? styles.statusAvail : styles.statusDone}`}>
                            {asset.status}
                          </span>
                        </div>
                        <h4>{asset.title}</h4>
                        <p className={styles.cardMeta}>Condition: {asset.assetCondition} | Category: {asset.type}</p>
                        
                        {asset.acquiredBy && (
                          <div className={styles.transactionMeta}>
                            <p>Customer: <strong>{asset.acquiredBy}</strong></p>
                            <button className={styles.chatBtn} onClick={() => startChat(asset)}>
                              <MessageSquare size={14} /> Chat with Customer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              purchasedAssets.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No purchased items yet. Browse listings to find products to buy, trade, or recycle!</p>
                </div>
              ) : (
                <div className={styles.assetList}>
                  {purchasedAssets.map(asset => (
                    <div key={asset.id} className={styles.dashboardCard}>
                      <div className={styles.cardImage}>
                        {asset.imageData ? (
                          <img src={asset.imageData} alt={asset.title} />
                        ) : (
                          <div className={styles.noImg}>📷</div>
                        )}
                      </div>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardHeader}>
                          <span className={styles.typeBadge}>
                            {getListingIcon(asset.listingType)}
                            {asset.listingType}
                          </span>
                          <span className={styles.statusDone}>
                            {asset.status}
                          </span>
                        </div>
                        <h4>{asset.title}</h4>
                        <p className={styles.cardMeta}>Seller: <strong>{asset.listedBy}</strong> | Location: {asset.location}</p>
                        
                        <div className={styles.transactionMeta}>
                          <button className={styles.chatBtn} onClick={() => startChat(asset)}>
                            <MessageSquare size={14} /> Chat with Seller
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* Chat Overlay Side Panel */}
      {activeChatAsset && (
        <div className={styles.chatOverlay} onClick={() => setActiveChatAsset(null)}>
          <div className={styles.chatPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.chatHeader}>
              <div className={styles.chatTitleBox}>
                <h4>{activeChatAsset.title}</h4>
                <p>Chat with {user === activeChatAsset.listedBy ? activeChatAsset.acquiredBy : activeChatAsset.listedBy}</p>
              </div>
              <button className={styles.closeChatBtn} onClick={() => setActiveChatAsset(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.chatMessages}>
              {chatMessages.length === 0 ? (
                <p className={styles.noChatText}>No messages yet. Send a hello to initiate contact!</p>
              ) : (
                chatMessages.map(msg => {
                  const isMe = msg.sender === user;
                  return (
                    <div key={msg.id} className={`${styles.messageBubble} ${isMe ? styles.messageMe : styles.messageThem}`}>
                      <span className={styles.messageSender}>{msg.sender}</span>
                      <p className={styles.messageText}>{msg.message}</p>
                      <span className={styles.messageTime}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={styles.chatForm}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                required
              />
              <button type="submit" className={styles.sendBtn}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
