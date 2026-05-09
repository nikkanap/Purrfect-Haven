import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import '../../styles/rescue.css';
import Button from '../../components/Button.jsx';

function RequestDetailsPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state?.fromSubmission) {
    return <Navigate to="/404" replace />;
  }
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await api.get(`/rescue/${reportId}`);
        setReport(response.data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load report details.');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <section className="report-details-wrapper">
        <div className="report-details-container">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="report-details-wrapper">
        <div className="report-details-container">
          <p className="error-message">{error}</p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="report-details-wrapper">
        <div className="report-details-container">
          <p>Report not found.</p>
        </div>
      </section>
    );
  }

  // Parse description to extract details
  const parseDescription = (desc) => {
    const lines = desc.split('\n');
    const details = {};

    lines.forEach((line) => {
      if (line.includes('**Reporter:**')) {
        details.reporter = line.replace('**Reporter:**', '').trim();
      } else if (line.includes('**Contact:**')) {
        details.contact = line.replace('**Contact:**', '').trim();
      } else if (line.includes('**Animal Type:**')) {
        details.animalType = line.replace('**Animal Type:**', '').trim();
      } else if (line.includes('**Estimated Count:**')) {
        details.estimatedCount = line.replace('**Estimated Count:**', '').trim();
      } else if (line.includes('**Date Spotted:**')) {
        details.dateSpotted = line.replace('**Date Spotted:**', '').trim();
      } else if (line.includes('**Time Spotted:**')) {
        details.timeSpotted = line.replace('**Time Spotted:**', '').trim();
      }
    });

    return details;
  };

  const details = parseDescription(report.description);
  const conditionStart = report.description.indexOf('**Condition & Description:**');
  const condition = conditionStart !== -1
    ? report.description.substring(conditionStart).replace('**Condition & Description:**', '').trim()
    : 'Not provided';

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
    <section className="report-details-wrapper">
      <div className="report-details-header">
        <h1>Rescue Request Submitted</h1>
        <p>Thank you for helping! Your report has been received and will be reviewed by our rescue volunteers.</p>
      </div>

      <div className="report-details-container">
        <div className="report-details-card">
          <h3 className="report-details-title">Report Details</h3>

          <div className="report-details-grid">
            <div className="report-detail-item">
              <label className="report-detail-label">Reporter Name</label>
              <p className="report-detail-value">{details.reporter || 'N/A'}</p>
            </div>

            <div className="report-detail-item">
              <label className="report-detail-label">Contact Number</label>
              <p className="report-detail-value">{details.contact || 'N/A'}</p>
            </div>

            <div className="report-detail-item">
              <label className="report-detail-label">Animal Type</label>
              <p className="report-detail-value">{details.animalType || 'N/A'}</p>
            </div>

            <div className="report-detail-item">
              <label className="report-detail-label">Estimated Count</label>
              <p className="report-detail-value">{details.estimatedCount || 'N/A'}</p>
            </div>

            <div className="report-detail-item">
              <label className="report-detail-label">Date Spotted</label>
              <p className="report-detail-value">{details.dateSpotted || 'N/A'}</p>
            </div>

            <div className="report-detail-item">
              <label className="report-detail-label">Time Spotted</label>
              <p className="report-detail-value">{details.timeSpotted || 'N/A'}</p>
            </div>
          </div>

          <div className="report-detail-item full-width">
            <label className="report-detail-label">Location</label>
            <p className="report-detail-value">{report.location || 'N/A'}</p>
          </div>

          <div className="report-detail-item full-width">
            <label className="report-detail-label">Condition & Description</label>
            <p className="report-detail-value condition">{condition}</p>
          </div>

          <div className="report-detail-timestamp">
            <p>Submitted on: {formatDate(report.date_reported)}</p>
          </div>

          <div className="report-detail-actions">
            <Button onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button onClick={() => window.print()}>
              Print Report
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RequestDetailsPage;
