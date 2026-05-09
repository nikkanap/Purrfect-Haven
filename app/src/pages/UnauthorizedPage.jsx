import { Link } from 'react-router-dom';
import '../styles/notfound.css';

function UnauthorizedPage() {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <div className="notfound-code">403</div>
        <h1 className="notfound-title">Access Denied</h1>
        <p className="notfound-message">
          You do not have permission to view this page. If you believe this is a
          mistake, please log in or create an account with the appropriate access.
        </p>
        <div className="notfound-actions">
          <Link to="/login" className="notfound-btn notfound-btn-primary">Log In</Link>
          <Link to="/signup" className="notfound-btn notfound-btn-secondary">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;