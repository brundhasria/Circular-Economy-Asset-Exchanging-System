import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('ce_token', data.token);
        localStorage.setItem('ce_username', data.username);
        localStorage.setItem('ce_role', data.role || 'USER');
        // Clean up old mock logic if exists
        localStorage.removeItem('ce_logged_in_user');
        
        navigate('/dashboard');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar variant="light" user={null} />
      
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.brandHeader}>
            <h2>CircularExchange</h2>
            <p>Reuse. Exchange. Sustain.</p>
          </div>
          
          <h3 className={styles.formTitle}>Welcome Back</h3>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <User size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="username"
                placeholder="Email / Username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
            
            {error && <div className={styles.errorBox}>{error}</div>}
            
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Authenticating...' : 'Login'} <ArrowRight size={18} />
            </button>
          </form>
          
          <div className={styles.authFooter}>
            <p>Don't have an account?</p>
            <Link to="/signup" className={styles.switchLink}>Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
