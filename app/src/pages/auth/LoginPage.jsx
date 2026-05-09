import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import FormCard from '../../components/FormCard.jsx';
import api from '../../services/api.js';
import '../../styles/forms.css';
import passHideIcon from '../../assets/icons/pass-hide.svg';
import passSeeIcon from '../../assets/icons/pass-see.svg';
import { useSearchParams } from "react-router-dom";
import Button from '../../components/Button.jsx';

function LoginPage() {
  // react use state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const queryString = searchParams.get('page');
  const loginH1 = !queryString ? "Welcome Back!" : `You Must Be Logged In`;
  const extraText = !queryString ? "" : (queryString === "report" ? 'To Report a Pet Rescue' : 'To Post a Pet For Adoption');
  
  // handle submit POST req. connect to endpoint built
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setLoading(true);

    // basic validation muna bago tumawag sa api
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user);
      console.log('FLAG SET!');   
      sessionStorage.setItem('showTriviaAfterLogin', 'true');
      console.log('Flag value:', sessionStorage.getItem('showTriviaAfterLogin'));
      navigate('/');
    } catch (err) {
      // backend nagrereturn ng { error: "..." }, dati ang hinahanap natin .message
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.';
      setGeneralError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const subtitle = extraText ? (
    <>
      <strong>{extraText}</strong>
      <br />
      Sign in to your account to continue
    </>
  ) : (
    'Sign in to your account to continue'
  );

  return (
    <FormCard title={loginH1} subtitle={subtitle}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className={`form-group ${errors.email ? 'form-group-error' : ''}`}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? 'input-error' : ''}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className={`form-group password-field ${errors.password ? 'form-group-error' : ''}`}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? 'input-error' : ''}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <img src={showPassword ? passSeeIcon : passHideIcon} alt={showPassword ? 'Hide password' : 'Show password'} />
          </button>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="checkbox-group">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember">Remember me</label>
        </div>

        <div className="form-link">
          <Link to="/forgotPassword">Forgot password?</Link>
        </div>

        {generalError && <div className="status-message error" style={{ fontSize: '12px', marginTop: '10px' }}>{generalError}</div>}

        <Button type="submit" disabled={loading} className="button-full">
          {loading ? 'LOGGING IN...' : 'LOG IN'}
        </Button>
      </form>

      <div className="auth-footer-link">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </FormCard>
  );
}

export default LoginPage;