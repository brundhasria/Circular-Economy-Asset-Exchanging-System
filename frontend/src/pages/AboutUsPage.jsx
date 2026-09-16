import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Earth, Heart, Award, Users } from 'lucide-react';
import styles from './LandingPage.module.css'; // Reusing landing page container styles

export default function AboutUsPage() {
  const [user, setUser] = useState(() => localStorage.getItem('ce_username'));

  const handleLogout = () => {
    localStorage.removeItem('ce_token');
    localStorage.removeItem('ce_username');
    setUser(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar variant="light" user={user} onLogout={handleLogout} />
      
      <main style={{ flex: 1, padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>
          About CircularExchange
        </h1>
        
        <p style={{ fontSize: '1.15rem', color: '#555', lineHeight: 1.6, marginBottom: '2.5rem', textAlign: 'center' }}>
          Our mission is to accelerate the transition to a global circular economy by making asset reuse, 
          exchange, recycling, and donation simple, accessible, and rewarding.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Earth size={20} color="#0a7338" /> Reduce Landfill Waste
            </h3>
            <p style={{ color: '#666', lineHeight: 1.5 }}>
              By extending the lifecycle of household goods, electronics, and clothing, we keep valuable items out of landfills and reduce carbon footprints.
            </p>
          </div>

          <div style={{ border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Award size={20} color="#1565c0" /> Gamified Impact (Eco-Points)
            </h3>
            <p style={{ color: '#666', lineHeight: 1.5 }}>
              Earn Eco-Points and badges for every asset you recycle, donate, or exchange. Compete on our community leaderboard!
            </p>
          </div>

          <div style={{ border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Users size={20} color="#6a1b9a" /> Community-Driven
            </h3>
            <p style={{ color: '#666', lineHeight: 1.5 }}>
              CircularExchange connects local citizens to build trust-based networks of giving, exchanging, and selling items sustainably.
            </p>
          </div>

          <div style={{ border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Heart size={20} color="#e65100" /> Transparent Donation
            </h3>
            <p style={{ color: '#666', lineHeight: 1.5 }}>
              Easily discover free items to claim or donate surplus goods directly to neighbors and organizations in need.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
