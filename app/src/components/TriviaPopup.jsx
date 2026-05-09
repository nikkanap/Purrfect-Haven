import { useEffect, useState } from 'react';
import { getTrivia } from '../services/triviaService.js';
import '../styles/TriviaPopup.css';

export default function TriviaPopup({ type, onClose }) {
  const [trivia, setTrivia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // i-fetch ang trivia pag mount
  useEffect(() => {
    let cancelled = false;

    async function fetchTrivia() {
      try {
        const data = await getTrivia(type);
        if (!cancelled) setTrivia(data);
      } catch (err) {
        if (!cancelled) setError('Hindi ma-load ang trivia.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTrivia();
    return () => { cancelled = true; };
  }, [type]);

  // optional — auto-dismiss after 10 seconds
  // tanggalin ang useEffect na 'to kung ayaw ng auto-close
  useEffect(() => {
    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="trivia-toast">
      <button className="trivia-close" onClick={onClose} aria-label="Close">×</button>

      <p className="trivia-label">Did you know?</p>

      {loading && <p className="trivia-loading">Loading a fun fact...</p>}
      {error && <p className="trivia-error">{error}</p>}

      {trivia && !loading && (
        <div className="trivia-body">
          <img src={trivia.image} alt={trivia.type} className="trivia-image" />
          <p className="trivia-fact">{trivia.fact}</p>
        </div>
      )}
    </div>
  );
}