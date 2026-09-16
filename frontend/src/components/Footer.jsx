import React from 'react';
import { Leaf } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.left}>
          <Leaf className={styles.leafIcon} size={48} />
          <div className={styles.brandText}>
            <h3>Together, let's build a</h3>
            <h2>greener and better future.</h2>
          </div>
        </div>
        <div className={styles.right}>
          <p>"The earth is what we all have in common.</p>
          <p>Let's protect it by reusing and exchanging."</p>
          <div className={styles.recycleBgIcon}>
            <Leaf size={120} opacity={0.1} />
          </div>
        </div>
      </div>
    </footer>
  );
}
