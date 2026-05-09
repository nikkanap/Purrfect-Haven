import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import '../styles/navbar.css';
import favicon from '../assets/favicon.png';
import dashboardIcon from '../assets/icons/dashboard.svg';
import logoutIcon from '../assets/icons/logout.svg';
import settingsIcon from '../assets/icons/settings.svg';
import notificationsIcon from '../assets/icons/notifications.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // proceed with logout even if request fails
    } finally {
      logout();
      navigate('/');
    }
  }
 
  // Fix logo styling in styles
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={favicon} alt="Purrfect Haven Logo" />
      </Link>

      <div className="navbar-right">
        <div className="navbar-links">
          <Link to="/pets">Find a pet</Link>
          <Link to="/about-us">About us</Link>
          { (!user || !user.is_admin) && (
            <>
              <Link to="/rescue">Request a rescue</Link>
              <Link to="/community">Community posts</Link>
            </>
          )}
          
        </div>

        <div className="navbar-links">
          {user ? (
            <div className="navbar-user-dropdown" ref={dropdownRef}>
              <button
                className="navbar-user-trigger"
                onClick={() => setDropdownOpen((o) => !o)}
              >
                {user && `${user.first_name} ${user.last_name}`}
                {user && `${user.is_admin ? ' (Admin)' : ''}`}
              </button>
              {dropdownOpen && (
                <div className="navbar-user-menu">
                  <Link
                    to="/dashboard"
                    className="navbar-user-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <img src={dashboardIcon} alt="Dashboard Icon" className="navbar-user-item-icon" /> Dashboard
                  </Link>

                  <Link
                    to="/settings"
                    className="navbar-user-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <img src={settingsIcon} alt="Settings Icon" className="navbar-user-item-icon" /> Settings
                  </Link>

                  <Link
                    to="/notifications"
                    className="navbar-user-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <img src={notificationsIcon} alt="Notifications Icon" className="navbar-user-item-icon" /> Notifications
                  </Link>

                  <button
                    className="navbar-user-item"
                    onClick={handleLogout}
                  >
                    <img src={logoutIcon} alt="Logout Icon" className="navbar-user-item-icon" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup" className="navbar-signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

    </nav>
  );
}