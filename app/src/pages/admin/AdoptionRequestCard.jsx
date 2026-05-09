import CollapsibleItem from '../../components/CollapsibleItem.jsx';

const STATUS_LABELS = {
  pending:               'Pending Review',
  under_review:          'Under Review',
  appointment_scheduled: 'Appointment Scheduled',
  approved:              'Approved',
  rejected:              'Rejected',
  completed:             'Completed',
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

function AdoptionRequestCard({
  request,
  onApprove,
  onReject,
  onScheduleAppointment,
  onMarkUnderReview,
  onComplete,
  onRequestWelfareCheck,
}) {
  const showSchedule    = request.status === 'pending';
  const showUnderReview = request.status === 'appointment_scheduled';
  const showApprove     = request.status === 'under_review';
  const showReject      = request.status === 'under_review' || request.status === 'approved';
  const showComplete    = request.status === 'approved';

  return (
    <CollapsibleItem
      wrapperClassName={`admin-card status-${request.status}`}
      headerClassName="card-header card-header-gradient"
      titleContainerClassName="card-header-text"
      contentClassName="card-content"
      TitleTag="h2"
      title={`Adoption Request for ${request.pet?.name}`}
      meta={`Requested by ${request.applicant?.full_name} on ${formatDate(request.date_applied)}`}
      statusLabel={STATUS_LABELS[request.status] || request.status}
      statusClass={`status-${request.status}`}
    >
      <div className="card-grid">
        {/* PET INFO */}
        <div className="info-section">
          <h3 className="section-title">PET DETAILS</h3>
          <div className="pet-card-mini">
            <div className="pet-mini-info">
              <h4 className="pet-mini-name">Pet Name</h4>
              <p>{request.pet?.name || 'Unknown Pet'}</p>

              <h4 className="pet-mini-name">Animal Type</h4>
              <p>{request.pet?.species_name || 'Unknown'}</p>

              <h4 className="pet-mini-name">Breed</h4>
              <p className="pet-mini-meta">
                {request.pet?.breed ? ` ${request.pet.breed}` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* APPLICANT INFO */}
        <div className="info-section">
          <h3 className="section-title">APPLICANT INFO</h3>

          <div className="detail-item">
            <h4>Full Name</h4>
            <p>{request.applicant?.full_name}</p>
          </div>

          <div className="detail-item">
            <h4>Email</h4>
            <p>{request.applicant?.email}</p>
          </div>

          <div className="detail-item">
            <h4>Phone</h4>
            <p>{request.applicant?.cell_num}</p>
          </div>

          <div className="detail-item">
            <h4>Location</h4>
            <p>{request.applicant_address}</p>
          </div>

          <div className="detail-item">
            <h4>Motivation</h4>
            <p style={{ whiteSpace: 'pre-wrap' }}>{request.motivation}</p>
          </div>
        </div>

        {/* LIVING SITUATION */}
        <div className="info-section">
          <h3 className="section-title">LIVING SITUATION</h3>

          <div className="detail-item">
            <h4>First Pet</h4>
            <p>{request.is_first_pet ? 'Yes' : 'No'}</p>
          </div>

          <div className="detail-item">
            <h4>Pet Experience</h4>
            <p>{request.has_experience ? 'Yes' : 'No'}</p>
          </div>

          <div className="detail-item">
            <h4>Other Pets</h4>
            <p>{request.has_other_pets ? 'Yes' : 'No'}</p>
          </div>

          <div className="detail-item">
            <h4>Has Children</h4>
            <p>{request.has_children ? 'Yes' : 'No'}</p>
          </div>

          <div className="detail-item">
            <h4>Home Ownership</h4>
            <p>{request.owns_home ? 'Owns home' : 'Rents'}</p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3 className="section-title">FINANCIAL CAPABILITY</h3>
        <div className="detail-item">
          <p style={{ whiteSpace: 'pre-wrap' }}>{request.financial_capability}</p>
        </div>
        {request.files?.length > 0 && (
          <div className="detail-item">
            <h4>Uploaded Files</h4>
            <ul>
              {request.files.map((file, idx) => (
                <li key={idx}>{file}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {request.status === 'appointment_scheduled' && request.appointment_date && (
        <div className="info-section" style={{ marginTop: '18px' }}>
          <h3 className="section-title">APPOINTMENT</h3>
          <div className="detail-item">
            <h4>Scheduled Date & Time</h4>
            <p>{formatDateTime(request.appointment_date)}</p>
          </div>
        </div>
      )}

      {(request.status === 'approved' || request.status === 'rejected') &&
        request.decision_note && (
          <div className="decision-display">
            <p className="decision-note-display">"{request.decision_note}"</p>
          </div>
        )}

      {(showSchedule || showUnderReview || showApprove || showReject || showComplete) && (
        <div className="action-buttons">
          {showSchedule && (
            <button className="schedule-btn" onClick={onScheduleAppointment}>
              Schedule Appointment
            </button>
          )}
          {showUnderReview && (
            <button className="schedule-btn" onClick={onMarkUnderReview}>
              Mark as Under Review
            </button>
          )}
          {showComplete && (
            <button className="approve-btn" onClick={onComplete}>
              Mark as Completed
            </button>
          )}
          {showApprove && (
            <button className="approve-btn" onClick={onApprove}>
              Approve
            </button>
          )}
          {showReject && (
            <button className="reject-btn" onClick={onReject}>
              Reject
            </button>
          )}
        </div>
      )}

      {request.status === 'completed' && (
        <div className="action-buttons">
          <button className="schedule-btn" onClick={onRequestWelfareCheck}>
            Request Welfare Check
          </button>
        </div>
      )}

      {request.status === 'rejected' && (
        <p className="status-note">
          This application has been <strong>Rejected</strong>.
        </p>
      )}
    </CollapsibleItem>
  );
}

export default AdoptionRequestCard;
