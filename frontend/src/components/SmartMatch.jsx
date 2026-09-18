import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import styles from './SmartMatch.module.css';

export default function SmartMatch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('AI is currently busy. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Sparkles className={styles.icon} size={28} />
        <div>
          <h2>Smart AI Match</h2>
          <p>Tell us what you need in natural language, and Gemini will find the perfect sustainable matches from our marketplace.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.inputWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="e.g. 'I need a laptop for college under ₹40000' or 'A comfortable chair for my home office'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.input}
          />
        </div>
        <button type="submit" disabled={isSearching || !query.trim()} className={styles.btn}>
          {isSearching ? 'Searching...' : 'Find Matches'}
        </button>
      </form>

      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {result && (
        <div className={styles.resultsArea}>
          <div className={styles.summaryBox}>
            <strong>🌱 Eco-Tip:</strong> {result.summary}
          </div>
          
          <h3 className={styles.resultsTitle}>Top Matches for you:</h3>
          <div className={styles.matchesList}>
            {result.matches && result.matches.length > 0 ? (
              result.matches.map((match, idx) => (
                <div key={idx} className={styles.matchCard}>
                  <div className={styles.matchId}>Asset #{match.id}</div>
                  <div className={styles.matchReason}>
                    <p>{match.reason}</p>
                  </div>
                  <button className={styles.viewBtn} onClick={() => navigate(`/asset/${match.id}`)}>
                    View Details <ArrowRight size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.noMatches}>No specific matches found. Try adjusting your search query!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
