import React, { useState } from 'react';
import { X, User, Lock } from 'lucide-react';
import styles from './LoginModal.module.css';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    // Simple client-side auth (saves to localStorage for demo)
    const users = JSON.parse(localStorage.getItem('ce_users') || '{}');
    if (isRegister) {
      if (users[formData.username]) {
        setError('Username already exists. Please login.');
        return;
      }
      users[formData.username] = formData.password;
      localStorage.setItem('ce_users', JSON.stringify(users));
    } else {
      if (!users[formData.username] || users[formData.username] !== formData.password) {
        setError('Invalid username or password.');
        return;
      }
    }
    localStorage.setItem('ce_logged_in_user', formData.username);
    onLogin(formData.username);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}><X size={22} /></button>

        <div className={styles.iconWrapper}>
          <User size={36} />
        </div>
        <h2 className={styles.title}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className={styles.subtitle}>{isRegister ? 'Join the circular economy!' : 'Login to list and exchange assets.'}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <User size={16} className={styles.inputIcon} />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>
          <div className={styles.inputGroup}>
            <Lock size={16} className={styles.inputIcon} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitBtn}>
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className={styles.toggle}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? ' Login' : ' Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
