import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import '../../styles/community.css';
import Button from '../../components/Button.jsx';

function CommunityDetailsPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state?.fromSubmission) {
    return <Navigate to="/404" replace />;
  }
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await api.get(`/community/${postId}`);
        console.log(response.data);
        setPost(response.data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post details.');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <section className="post-details-wrapper">
        <div className="post-details-container">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="post-details-wrapper">
        <div className="post-details-container">
          <p className="error-message">{error}</p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="post-details-wrapper">
        <div className="post-details-container">
          <p>Post not found.</p>
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
    <section className="post-details-wrapper">
      <div className="post-details-header">
        <h1>Community Post Submitted</h1>
        <p>Thank you for your submission! Your post has been received and will be reviewed by our admin.</p>
      </div>

      <div className="post-details-container">
        <div className="post-details-card">
          <h3 className="post-details-title">Post Details</h3>

          <div className="post-details-grid">
            <div className="post-detail-item">
              <label className="post-detail-label">Post ID</label>
              <p className="post-detail-value">{post.post_id || 'N/A'}</p>
            </div>

            <div className="post-detail-item">
              <label className="post-detail-label">Pet Name</label>
              <p className="post-detail-value">{post.pet_name || 'N/A'}</p>
            </div>

            <div className="post-detail-item">
              <label className="post-detail-label">Animal Type</label>
              <p className="post-detail-value">{post.species_name || 'N/A'}</p>
            </div>

            <div className="post-detail-item">
              <label className="post-detail-label">Breed</label>
              <p className="post-detail-value">{post.breed || 'N/A'}</p>
            </div>

            <div className="post-detail-item">
              <label className="post-detail-label">Sex</label>
              <p className="post-detail-value">{post.sex || 'N/A'}</p>
            </div>

            <div className="post-detail-item">
              <label className="post-detail-label">Age</label>
              <p className="post-detail-value">{post.age || 'N/A'}</p>
            </div>

            <div className="post-detail-item">
              <label className="post-detail-label">Color</label>
              <p className="post-detail-value">{post.color || 'N/A'}</p>
            </div>

            <div className="post-detail-item">
              <label className="post-detail-label">Health</label>
              <p className="post-detail-value">{post.health || 'N/A'}</p>
            </div>

            <div className="post-detail-item">
              <label className="post-detail-label">Personality</label>
              <p className="post-detail-value">{post.personality || 'N/A'}</p>
            </div>

            <div className="post-detail-item">
              <label className="post-detail-label">Organization</label>
              <p className="post-detail-value">{post.organization || 'N/A'}</p>
            </div>

            <div className="post-detail-item">
              <label className="post-detail-label">Description</label>
              <p className="post-detail-value">{post.description || 'N/A'}</p>
            </div>

            <div className="post-detail-item">
              <label className="post-detail-label">Admin Note</label>
              <p className="post-detail-value">{post.adminNote || 'N/A'}</p>
            </div>
            
          </div>

          <div className="post-detail-item full-width">
            <label className="post-detail-label">Location</label>
            <p className="post-detail-value">{post.location || 'N/A'}</p>
          </div>

          <div className="post-detail-timestamp">
            <p>Submitted on: {formatDate(post.date_posted)}</p>
          </div>

          <div className="post-detail-actions">
            <Button onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button onClick={() => window.print()}>
              Print Post
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CommunityDetailsPage;
