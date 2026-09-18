import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { X, User, Lock, Mail } from 'lucide-react';
import styles from './LoginModal.module.css';

const BACKEND_URL = API_BASE_URL;

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        if (!formData.email.trim()) { setError('Email is required.'); setLoading(false); return; }
        const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, email: formData.email, password: formData.password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.message || 'Registration failed.'); setLoading(false); return; }
        // Auto-login after register
        const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, password: formData.password }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) { setError('Registered! Please login.'); setLoading(false); setIsRegister(false); return; }
        localStorage.setItem('ce_token', loginData.token);
        localStorage.setItem('ce_username', loginData.username);
        localStorage.setItem('ce_role', loginData.role || 'USER');
        onLogin(loginData.username);
        onClose();
      } else {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, password: formData.password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.message || 'Invalid username or password.'); setLoading(false); return; }
        localStorage.setItem('ce_token', data.token);
        localStorage.setItem('ce_username', data.username);
        localStorage.setItem('ce_role', data.role || 'USER');
        onLogin(data.username);
        onClose();
      }
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
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
          {isRegister && (
            <div className={styles.inputGroup}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
          )}
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
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}
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
