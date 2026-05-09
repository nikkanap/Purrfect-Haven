import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import '../../styles/adoptform.css';
import Button from '../../components/Button.jsx';

function AdoptionDetailsPage() {
  const { adoption_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state?.fromSubmission) {
    return <Navigate to="/404" replace />;
  }
  const [adopt, setAdopt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAdopt() {
      try {
        console.log(adoption_id)
        const response = await api.get(`/adoptions/${adoption_id}`);
        console.log(response.data);
        setAdopt(response.data);
      } catch (err) {
        console.error('Error fetching adopt:', err);
        setError('Failed to load adopt details.');
      } finally {
        setLoading(false);
      }
    }

    fetchAdopt();
  }, [adoption_id]);

  if (loading) {
    return (
      <section className="adopt-details-wrapper">
        <div className="adopt-details-container">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="adopt-details-wrapper">
        <div className="adopt-details-container">
          <p className="error-message">{error}</p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </section>
    );
  }

  if (!adopt) {
    return (
      <section className="adopt-details-wrapper">
        <div className="adopt-details-container">
          <p>Adopt not found.</p>
        </div>
      </section>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="adopt-details-wrapper">
      <div className="adopt-details-header">
        <h1>Adoption Application Submitted</h1>
        <p>Thank you for applying for a pet adoption! Your application has been received and will be reviewed by our admin.</p>
      </div>

      <div className="adopt-details-container">
        <div className="adopt-details-card">
          <h3 className="adopt-details-title">Adopt Details</h3>

          <div className="adopt-details-grid">
            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Adoption ID</label>
              <p className="adopt-detail-value">{adopt.adoption_id || 'N/A'}</p>
            </div>

            <div className="adopt-detail-item"></div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Pet Name</label>
              <p className="adopt-detail-value">{adopt.pet.name || 'N/A'}</p>
            </div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Species</label>
              <p className="adopt-detail-value">{adopt.species_name || 'N/A'}</p>
            </div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Breed</label>
              <p className="adopt-detail-value">{adopt.breed || 'N/A'}</p>
            </div>

            <div className="adopt-detail-item"></div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Financial Capability</label>
              <p className="adopt-detail-value">{adopt.financial_capability || 'N/A'}</p>
            </div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Has Children</label>
              <p className="adopt-detail-value">{adopt.has_children ? 'True' : 'False'}</p>
            </div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Has Prior Pet Experience</label>
              <p className="adopt-detail-value">{adopt.has_experience ? 'True' : 'False'}</p>
            </div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Has Other Pets</label>
              <p className="adopt-detail-value">{adopt.has_children ? 'True' : 'False'}</p>
            </div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Is First Pet</label>
              <p className="adopt-detail-value">{adopt.is_first_pet ? 'True' : 'False'}</p>
            </div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Owns Home</label>
              <p className="adopt-detail-value">{adopt.owns_home ? 'True' : 'False'}</p>
            </div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Motivation</label>
              <p className="adopt-detail-value">"{adopt.motivation || 'N/A'}"</p>
            </div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Applicant Address</label>
              <p className="adopt-detail-value">"{adopt.applicant_address || 'N/A'}"</p>
            </div>

            <div className="adopt-detail-item">
              <label className="adopt-detail-label">Status</label>
              <p className="adopt-detail-value">{(adopt.status).toUpperCase() || 'N/A'}</p>
            </div>
          </div>

          <div className="adopt-detail-timestamp">
            <p>Submitted on: {formatDate(adopt.date_applied)}</p>
          </div>

          <div className="adopt-detail-actions">
            <Button onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button onClick={() => window.print()}>
              Print adopt
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdoptionDetailsPage;
