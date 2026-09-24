import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, PlusCircle, LogOut, Moon, Sun, User } from 'lucide-react';
import AddAssetModal from './AddAssetModal';
import styles from './Navbar.module.css';

export default function Navbar({ variant = 'light', user, onLogin, onLogout, onAssetAdded }) {
  const isDark = variant === 'dark';
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const [isGlobalDark, setIsGlobalDark] = useState(() => {
    const saved = localStorage.getItem('ce_theme');
    if (saved) return saved === 'dark';
    return document.body.classList.contains('dark-theme');
  });

  useEffect(() => {
    if (isGlobalDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isGlobalDark]);

  const toggleTheme = () => {
    const nextDark = !isGlobalDark;
    setIsGlobalDark(nextDark);
    localStorage.setItem('ce_theme', nextDark ? 'dark' : 'light');
  };

  const handleListAsset = () => {
    if (!user) {
      navigate('/login');
    } else {
      setIsAssetModalOpen(true);
    }
  };

  return (
    <nav className={`${styles.navbar} ${isDark ? styles.dark : styles.light}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link to="/" className={styles.logo}>
          <Recycle className={styles.logoIcon} size={28} />
          <div className={styles.logoText}>
            <h1>CircularExchange</h1>
            <p>Reuse. Exchange. Sustain.</p>
          </div>
        </Link>
        <div className={styles.navLinks}>
          <Link to="/" className={styles.link}>Home</Link>
          <Link to="/browse" className={styles.link}>Browse Assets</Link>
          <Link to="/dashboard" className={styles.link}>My Dashboard</Link>
          <Link to="/about" className={styles.link}>About Us</Link>

          <button onClick={handleListAsset} className={styles.listAssetBtn}>
            <PlusCircle size={16} />
            List Asset
          </button>

          <button onClick={toggleTheme} className={styles.themeToggleBtn} title="Toggle Dark Mode" style={{ border: 'none', background: 'none', padding: '8px', cursor: 'pointer', color: 'inherit' }}>
            {isGlobalDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className={styles.userProfile}>
              <Link to="/profile" className={styles.profileLinkWrapper}>
                <div className={styles.avatar}>{user[0].toUpperCase()}</div>
                <span>{user}</span>
              </Link>
              <button onClick={onLogout} className={styles.logoutBtn} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>
      </div>

      <AddAssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        user={user}
        onAssetAdded={onAssetAdded}
      />
    </nav>
  );
}
