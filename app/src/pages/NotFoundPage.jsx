import { Link } from 'react-router-dom';
import '../styles/notfound.css';

function NotFoundPage() {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-message">
          Looks like this page wandered off. The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn notfound-btn-primary">Go Home</Link>
          <Link to="/pets" className="notfound-btn notfound-btn-secondary">Browse Pets</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
