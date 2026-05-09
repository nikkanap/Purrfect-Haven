import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import '../styles/settings.css';
import Button from '../components/Button.jsx';
import passHideIcon from '../assets/icons/pass-hide.svg';
import passSeeIcon from '../assets/icons/pass-see.svg';
import { useSearchParams } from "react-router-dom";

function SettingsPage() {
  const { user, login } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [confirmPass, setConfirmPass] = useState('');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [page1, setpage1] = useState(true);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setContactNo(user.cell_num || '');
    }
  }, [user]);

  const isProfileDirty = useMemo(() => {
    if (!user) return false;
    return (
      firstName !== (user.first_name || '') ||
      lastName !== (user.last_name || '') ||
      email !== (user.email || '') ||
      contactNo !== (user.cell_num || '')
    );
  }, [user, firstName, lastName, email, contactNo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setSuccessMessage('');

    if (page1 && !isProfileDirty) {
      setSuccessMessage('No details changed!');
      return;
    }

    setLoading(true);

    const newErrors = {};
    if (page1) {
      if (!firstName) newErrors.firstName = 'First Name is required';
      if (!lastName) newErrors.lastName = 'Last Name is required';
      if (!email) newErrors.email = 'Email is required';
      if (!contactNo) newErrors.contactNo = 'Contact Number is required';
    } else {
      if (!currentPass) newErrors.currentPass = 'Current Password is required';
      if (!newPass) newErrors.newPass = 'New Password is required';
      if (!confirmPass) newErrors.confirmPass = 'Confirm Password is required';
      if (newPass !== confirmPass) newErrors.confirmPass = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      if (page1) {
        const { data } = await api.put('/users/profile', {
          first_name: firstName,
          last_name: lastName,
          email: email,
          cell_num: contactNo
        });
        
        login(data.user);
        setSuccessMessage('Profile changed successfully!');
      } else {
        await api.put('/users/change-password', {
          current_password: currentPass,
          new_password: newPass
        });
        
        setSuccessMessage('Password changed successfully!');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      }
    } catch (err) {
      // Logic updated: Grabs the error message from the usersController.js
      setGeneralError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="settings-card-top">
          <h1>Account Settings</h1>
          <p>Manage your account information and security settings</p>
        </div>

        <div className="settings-card-nav">
          <button 
            className={page1 ? "current" : ""}
            onClick={() => { setpage1(true); setErrors({}); setSuccessMessage(''); setGeneralError(''); }}
          >Profile Information</button>
          <button 
            className={!page1 ? "current" : ""}
            onClick={() => { setpage1(false); setErrors({}); setSuccessMessage(''); setGeneralError(''); }}
          >Change Password</button>
        </div>    
        
        { page1 ?
          <form className="settings-form profile-information" onSubmit={handleSubmit}>
            <div className="profile-info-title">
              <h2>Profile Information</h2>
              <p>Update your personal information and contact details.</p>
            </div>
            
            <div className="flex-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  placeholder="Enter new first name"
                  onChange={(e) => {setFirstName(e.target.value); setSuccessMessage(''); setErrors({}); setGeneralError('');}}
                  className={errors.firstName ? 'input-error' : ''}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  placeholder="Enter new last name"
                  onChange={(e) => {setLastName(e.target.value); setSuccessMessage(''); setErrors({}); setGeneralError('');}}
                  className={errors.lastName ? 'input-error' : ''}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="Enter new email address"
                  onChange={(e) => {setEmail(e.target.value); setSuccessMessage(''); setErrors({}); setGeneralError('');}}
                  className={errors.email ? 'input-error' : ''}
                  required
                />
            </div>
            <div className="form-group">
              <label htmlFor="contactNo">Phone Number</label>
              <input
                  id="contactNo"
                  type="tel"
                  value={contactNo}
                  placeholder="Enter new phone number"
                  onChange={(e) => {setContactNo(e.target.value); setSuccessMessage(''); setErrors({}); setGeneralError('');}}
                  className={errors.contactNo ? 'input-error' : ''}
                required
                />
            </div>

            {/* Error/Success Stack above the button */}
            <div className="message-stack" style={{ marginBottom: '1.5rem' }}>
              {Object.values(errors).map((err, idx) => (
                <div key={idx} className="warning-banner" style={{ marginBottom: '0.5rem', padding: '0.5rem' }}>{err}</div>
              ))}
              {generalError && <div className="warning-banner" style={{ marginBottom: '0.5rem' }}>{generalError}</div>}
              {successMessage && (
                <div className={successMessage === 'No details changed!' ? "warning-banner" : "success-banner"}>
                  {successMessage}
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Updating Profile...' : 'Update Profile'}
            </Button>
          </form> :
          <form className="settings-form change-password" onSubmit={handleSubmit}>
            <div className="profile-info-title">
              <h2>Change Password</h2>
              <p>Change your password regularly to protect your account.</p>
            </div>

            <div className="form-group password-field">
              <label htmlFor="currentPass">Current Password</label>
              <input
                id="currentPass"
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPass}
                placeholder="Enter current password"
                onChange={(e) => {setCurrentPass(e.target.value); setSuccessMessage(''); setErrors({}); setGeneralError('');}}
                className={errors.currentPass ? 'input-error' : ''}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                aria-label={showCurrentPass ? 'Hide password' : 'Show password'}
              >
                <img src={showCurrentPass ? passSeeIcon : passHideIcon} alt="toggle" />
              </button>
            </div>
            <div className="form-group password-field">
              <label htmlFor="newPass">New Password</label>
              <input
                id="newPass"
                type={showNewPass ? 'text' : 'password'}
                value={newPass}
                placeholder="Enter new password"
                onChange={(e) => {setNewPass(e.target.value); setSuccessMessage(''); setErrors({}); setGeneralError('');}}
                className={errors.newPass ? 'input-error' : ''}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNewPass(!showNewPass)}
                aria-label={showNewPass ? 'Hide password' : 'Show password'}
              >
                <img src={showNewPass ? passSeeIcon : passHideIcon} alt="toggle" />
              </button>
            </div>
            <div className="form-group password-field">
              <label htmlFor="confirmPass">Confirm New Password</label>
              <input
                id="confirmPass"
                type="password"
                value={confirmPass}
                placeholder="Re-enter new password"
                onChange={(e) => {setConfirmPass(e.target.value); setSuccessMessage(''); setErrors({}); setGeneralError('');}}
                className={errors.confirmPass ? 'input-error' : ''}
                required
              />
            </div>

            {/* Error/Success Stack above the button */}
            <div className="message-stack" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
              {Object.values(errors).map((err, idx) => (
                <div key={idx} className="warning-banner" style={{ marginBottom: '0.5rem', padding: '0.5rem' }}>{err}</div>
              ))}
              {generalError && <div className="warning-banner" style={{ marginBottom: '0.5rem' }}>{generalError}</div>}
              {successMessage && (
                <div className={successMessage === 'No details changed!' ? "warning-banner" : "success-banner"}>
                  {successMessage}
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        }
      </div>
    </div>
  );
}

export default SettingsPage;