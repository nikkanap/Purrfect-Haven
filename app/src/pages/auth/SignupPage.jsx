import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import '../../styles/forms.css';
import Button from '../../components/Button.jsx';
import passHideIcon from '../../assets/icons/pass-hide.svg';
import passSeeIcon from '../../assets/icons/pass-see.svg';

function SignupPage() {
  // mga form fields — naka-snake_case ang ilan para tugma sa backend
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [cellNum, setCellNum] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // mga ui states (show password, error, loading)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // check kung tugma yung password at confirm
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // backend requires 8 chars minimum, kaya ginawa ko ring 8 dito
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // ipasa ang field names na pareho ng backend (snake_case)
      const response = await api.post('/auth/signup', {
        first_name: firstName,
        last_name: lastName,
        city,
        email,
        cell_num: cellNum,
        password,
      });

      // pag successful, ilagay agad sa auth context at i-redirect sa home
      login(response.data.user);
      sessionStorage.setItem('showTriviaAfterLogin', 'true');
      navigate('/');
    } catch (err) {
      // backend nagrereturn ng { error: "..." }, hindi message
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Join Purrfect Haven to adopt or rescue pets</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          {/* bagong field — kailangan ng backend, dati wala sa form */}
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              placeholder="e.g. Tacloban City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cellNum">Phone Number</label>
            <input
              id="cellNum"
              type="tel"
              placeholder="09171234567"
              value={cellNum}
              onChange={(e) => setCellNum(e.target.value)}
              required
            />
          </div>

          <div className="form-group password-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <img src={showPassword ? passSeeIcon : passHideIcon} alt="" />
            </button>
          </div>

          <div className="form-group password-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <img src={showConfirmPassword ? passSeeIcon : passHideIcon} alt="" />
            </button>
          </div>

          {error && <div className="status-message error" style={{ fontSize: '12px', marginTop: '10px' }}>{error}</div>}

          <Button type="submit" disabled={loading} className="button-full">
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </Button>
        </form>

        <div className="auth-footer-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;