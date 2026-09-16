import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Trophy, Medal, Package, Recycle, ArrowLeftRight, Activity } from 'lucide-react';
import Navbar from '../components/Navbar';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const [user, setUser] = useState(() => localStorage.getItem('ce_username'));
  const [stats, setStats] = useState({
    ecoPoints: 0,
    rank: 'Starter',
    listed: 0,
    recycled: 0,
    exchanged: 0,
    history: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('ce_token');
        // Fetch all assets to compute stats (in a real app, backend provides a /profile endpoint)
        const res = await fetch('http://localhost:8081/api/assets', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const allAssets = await res.json();
          
          let listedCount = 0;
          let recycledCount = 0;
          let exchangedCount = 0;
          let points = 0;
          let userHistory = [];

          allAssets.forEach(asset => {
            if (asset.listedBy === user) {
              listedCount++;
              
              if (asset.status === 'Recycled') {
                recycledCount++;
                points += (asset.ecoPointsAwarded || 0);
                userHistory.push(asset);
              } else if (asset.status === 'Exchanged' || asset.status === 'Sold') {
                exchangedCount++;
                points += (asset.ecoPointsAwarded || 0);
                userHistory.push(asset);
              }
            } else if (asset.acquiredBy === user) {
                userHistory.push(asset);
            }
          });
          
          let badge = "Starter";
          if (points >= 200) badge = "Eco Master";
          else if (points >= 100) badge = "Circular Citizen";
          else if (points >= 50) badge = "Recycler";

          setStats({
            ecoPoints: points,
            rank: badge,
            listed: listedCount,
            recycled: recycledCount,
            exchanged: exchangedCount,
            history: userHistory.sort((a, b) => b.id - a.id) // Sort newest first loosely
          });
        }
      } catch (err) {
        console.error("Error fetching profile stats", err);
      }
    };

    fetchProfileData();
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ce_token');
    localStorage.removeItem('ce_username');
    navigate('/login');
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar variant="light" user={user} onLogout={handleLogout} />
      
      <div className={`container ${styles.profileLayout}`}>
        
        {/* Profile Sidebar Card */}
        <div className={styles.profileSidebar}>
          <div className={styles.avatarBig}>
            {user ? user[0].toUpperCase() : 'U'}
          </div>
          <h2 className={styles.userName}>{user}</h2>
          
          <div className={styles.rankBadge}>
            <Medal size={18} /> {stats.rank}
          </div>

          <div className={styles.totalPoints}>
            <Trophy size={24} className={styles.trophyIcon} />
            <div className={styles.pointsText}>
              <span className={styles.pointsValue}>{stats.ecoPoints}</span>
              <span className={styles.pointsLabel}>Total Eco-Points</span>
            </div>
          </div>
        </div>

        {/* Profile Main Content */}
        <div className={styles.profileMain}>
          <h3 className={styles.sectionTitle}>Your Impact</h3>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <Package size={24} className={styles.statIconBlue} />
              <div className={styles.statInfo}>
                <h4>{stats.listed}</h4>
                <p>Assets Listed</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <ArrowLeftRight size={24} className={styles.statIconGreen} />
              <div className={styles.statInfo}>
                <h4>{stats.exchanged}</h4>
                <p>Assets Exchanged</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <Recycle size={24} className={styles.statIconOrange} />
              <div className={styles.statInfo}>
                <h4>{stats.recycled}</h4>
                <p>Assets Recycled</p>
              </div>
            </div>
          </div>

          <h3 className={styles.sectionTitle} style={{marginTop: '2rem'}}>
            <Activity size={20} /> Recent Activity
          </h3>
          
          <div className={styles.activityList}>
            {stats.history.length === 0 ? (
              <p className={styles.emptyState}>No completed transactions yet.</p>
            ) : (
              stats.history.map((item, idx) => (
                <div key={idx} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    {item.status === 'Recycled' ? <Recycle size={18}/> : <ArrowLeftRight size={18}/>}
                  </div>
                  <div className={styles.activityDetails}>
                    <p className={styles.activityText}>
                      You <strong>{item.status.toLowerCase()}</strong> a {item.type} ({item.title})
                    </p>
                    <span className={styles.activityDate}>{item.transactionDate || 'Recently'}</span>
                  </div>
                  {item.listedBy === user && item.ecoPointsAwarded > 0 && (
                    <div className={styles.activityPoints}>
                      +{item.ecoPointsAwarded} pts
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
