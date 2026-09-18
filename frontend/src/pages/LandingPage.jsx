import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Recycle, Handshake, Leaf, ArrowRight, DollarSign, Gift, ArrowLeftRight, ShieldCheck, Sparkles, Earth } from 'lucide-react';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const [user, setUser] = useState(() => localStorage.getItem('ce_username'));
  const [stats, setStats] = useState({ total: 0, available: 0, exchanged: 0, sold: 0, recycled: 0, donated: 0 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/assets/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => console.error("Could not fetch stats"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ce_token');
    localStorage.removeItem('ce_username');
    setUser(null);
  };

  return (
    <div className={styles.page}>
      <Navbar variant="light" user={user} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Sparkles size={16} className={styles.sparkleIcon} />
              <span>Powered by Gemini 1.5 Flash AI</span>
            </div>
            <h1 className={styles.heroTitle}>
              Sustain the Loop, <br />
              <span className={styles.highlight}>Recreate Value</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Avoid waste and discover second lives for electronics, furniture, books, and clothing. 
              List to trade, sell, recycle, or donate instantly.
            </p>
            <div className={styles.heroButtons}>
              <Link to="/browse" className={styles.btnPrimary}>
                Explore Listings <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className={styles.btnSecondary}>
                Learn More
              </a>
            </div>
          </div>
          
          <div className={styles.heroGraphics}>
            <div className={styles.mainOrb}>
              <Recycle size={110} className={styles.spinningLogo} />
              <div className={styles.pulseRing1}></div>
              <div className={styles.pulseRing2}></div>
            </div>
            
            {/* Floating Option Cards */}
            <div className={`${styles.floatingCard} ${styles.float1}`}>
              <ArrowLeftRight size={20} className={styles.cardIconExchange} />
              <div>
                <h4>Exchange</h4>
                <span>Swap items</span>
              </div>
            </div>
            <div className={`${styles.floatingCard} ${styles.float2}`}>
              <DollarSign size={20} className={styles.cardIconSell} />
              <div>
                <h4>Sell</h4>
                <span>Fair pricing</span>
              </div>
            </div>
            <div className={`${styles.floatingCard} ${styles.float3}`}>
              <Recycle size={20} className={styles.cardIconRecycle} />
              <div>
                <h4>Recycle</h4>
                <span>E-Waste drop</span>
              </div>
            </div>
            <div className={`${styles.floatingCard} ${styles.float4}`}>
              <Gift size={20} className={styles.cardIconDonate} />
              <div>
                <h4>Donate</h4>
                <span>Support others</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid (Exchange / Sell / Recycle / Donate) */}
      <section className={`container ${styles.modesSection}`}>
        <h2 className={styles.sectionTitle}>Four Ways to Participate</h2>
        <p className={styles.sectionSubtitle}>Choose a circular pathway that matches your item's condition.</p>
        
        <div className={styles.modesGrid}>
          <div className={`${styles.modeCard} ${styles.modeExchange}`}>
            <div className={styles.modeIconBox}><ArrowLeftRight size={28} /></div>
            <h3>Exchange Items</h3>
            <p>Exchange goods you no longer need for items you actually want. Safe barter trading.</p>
            <Link to="/browse" className={styles.modeLink}>Try Swapping &rarr;</Link>
          </div>

          <div className={`${styles.modeCard} ${styles.modeSell}`}>
            <div className={styles.modeIconBox}><DollarSign size={28} /></div>
            <h3>Sell Direct</h3>
            <p>Set a fair price, list details, and earn pocket cash by matching local buyers directly.</p>
            <Link to="/browse" className={styles.modeLink}>Browse Shop &rarr;</Link>
          </div>

          <div className={`${styles.modeCard} ${styles.modeRecycle}`}>
            <div className={styles.modeIconBox}><Recycle size={28} /></div>
            <h3>Recycle Cleanly</h3>
            <p>Free broken tech or plastics from ending up in landfills. Schedule responsible recycling pickups.</p>
            <Link to="/browse" className={styles.modeLink}>Request Pickup &rarr;</Link>
          </div>

          <div className={`${styles.modeCard} ${styles.modeDonate}`}>
            <div className={styles.modeIconBox}><Gift size={28} /></div>
            <h3>Donate Items</h3>
            <p>Support your community by listing items for free. Ideal for books, clothing, and household goods.</p>
            <Link to="/browse" className={styles.modeLink}>Claim Free &rarr;</Link>
          </div>
        </div>
      </section>

      {/* Live Stats Panel */}
      <section className={styles.statsSection}>
        <div className={`container ${styles.statsContainer}`}>
          <div className={styles.statsHeader}>
            <h2>Circular Impact Tracking</h2>
            <p>Live, real-time counters representing circular assets saved from dumping sites.</p>
          </div>
          
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <div className={styles.statIcon}><Earth size={32} /></div>
              <h3 className={styles.statNumber}>{stats.total}</h3>
              <p className={styles.statLabel}>Total Saved Assets</p>
            </div>
            
            <div className={styles.statBox}>
              <div className={styles.statIcon}><ShieldCheck size={32} /></div>
              <h3 className={styles.statNumber}>{stats.available}</h3>
              <p className={styles.statLabel}>Active Listings</p>
            </div>
            
            <div className={styles.statBox}>
              <div className={styles.statIcon}><Leaf size={32} /></div>
              <h3 className={styles.statNumber}>{stats.exchanged + stats.sold + stats.donated + stats.recycled}</h3>
              <p className={styles.statLabel}>Success Transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className={`container ${styles.howItWorks}`}>
        <h2 className={styles.sectionTitle}>Simple Steps to Zero Waste</h2>
        <div className={styles.stepsGrid}>
          
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>01</div>
            <h3 className={styles.stepTitle}>Snap & Appraise</h3>
            <p className={styles.stepDesc}>List your asset with details. Set a price or mark it for donation to the community.</p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>02</div>
            <h3 className={styles.stepTitle}>Choose Pathway</h3>
            <p className={styles.stepDesc}>Determine whether to Swap, Sell, Donate, or Recycle. Specify contact info and pickup location address.</p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>03</div>
            <h3 className={styles.stepTitle}>Direct Pick-up</h3>
            <p className={styles.stepDesc}>Once selected, users retrieve owner contact cards to finalize transport directly, building local ties.</p>
          </div>
          
        </div>
      </section>

      {/* Trust Banner CTA */}
      <section className={styles.ctaBanner}>
        <div className={`container ${styles.ctaContent}`}>
          <h2>Ready to Declutter Sustainably?</h2>
          <p>Join thousands of users in India minimizing waste and recycling efficiently.</p>
          <Link to="/browse" className={styles.ctaBtn}>Get Started Now</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
