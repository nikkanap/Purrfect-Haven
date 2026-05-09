import CollapsibleItem from '../../components/CollapsibleItem.jsx';

const STATUS_LABELS = {
  pending:     'Pending Review',
  in_progress: 'In Progress',
  resolved:    'Resolved',
  closed:      'Closed',
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

const parseRescueDescription = (desc) => {
  if (!desc) return {};
  const details = {};
  const lines = desc.split('\n');
  lines.forEach((line) => {
    if (line.includes('**Reporter:**')) details.reporter = line.replace('**Reporter:**', '').trim();
    if (line.includes('**Contact:**')) details.contact = line.replace('**Contact:**', '').trim();
    if (line.includes('**Animal Type:**')) details.animalType = line.replace('**Animal Type:**', '').trim();
    if (line.includes('**Estimated Count:**')) details.count = line.replace('**Estimated Count:**', '').trim();
    if (line.includes('**Date Spotted:**')) details.date = line.replace('**Date Spotted:**', '').trim();
    if (line.includes('**Time Spotted:**')) details.time = line.replace('**Time Spotted:**', '').trim();
  });
  const conditionMatch = desc.split('**Condition & Description:**');
  details.condition = conditionMatch.length > 1 ? conditionMatch[1].trim() : '';
  return details;
};

function RescueRequestCard({
  report,
  onDispatch,
  onResolve,
  onClose,
}) {
  const details = parseRescueDescription(report.description);

  const showDispatch = report.status === 'pending';
  const showReject   = report.status === 'pending';
  const showResolve  = report.status === 'in_progress';
  const showClose    = report.status === 'in_progress';
  const isFinal      = report.status === 'resolved' || report.status === 'closed';
  
  return (
    <CollapsibleItem
      wrapperClassName={`admin-card status-${report.status}`}
      headerClassName="card-header card-header-gradient"
      titleContainerClassName="card-header-text"
      contentClassName="card-content"
      TitleTag="h2"
      title={`Rescue Spotting at ${report.location}`}
      meta={`Requested by ${report.reporter_name} on ${formatDate(report.date_reported)}`}
      statusLabel={STATUS_LABELS[report.status] || report.status}
      statusClass={`status-${report.status}`}
    >
      <div className="card-grid card-grid-two">
        <div className="info-section">
          <h3>REQUEST CONTENT</h3>
          <h4>Reporter</h4><p>{details.reporter || 'N/A'}</p>
          <h4>Contact</h4><p>{details.contact || 'N/A'}</p>
          <h4>Animal Type</h4>
          <p style={{ textTransform: 'capitalize' }}>{details.animalType || 'N/A'}</p>
          <h4>Estimated Count</h4><p>{details.count || 'N/A'}</p>
          <h4 style={{ marginTop: '15px' }}>Condition & Description</h4>
          <p>{details.condition || 'N/A'}</p>
        </div>

        <div className="info-section">
          <h3>POSTED BY</h3>
          <h4>Full Name</h4><p>{report.reporter_name}</p>
          <h4>Location Reported</h4><p>{report.location}</p>

          {report.date_resolved && (
            <>
              <h4>Date Resolved</h4>
              <p>{formatDate(report.date_resolved)}</p>
            </>
          )}
        </div>
      </div>

      {report.admin_note && (
        <div className="decision-display">
          <p className="decision-note-display">"{report.admin_note}"</p>
        </div>
      )}

      {!isFinal && (
        <div className="action-buttons" style={{ marginTop: '20px' }}>
          {showDispatch && (
            <button className="approve-btn" onClick={onDispatch}>
              Approve & Dispatch
            </button>
          )}
          {showResolve && (
            <button className="approve-btn" onClick={onResolve}>
              Mark as Resolved
            </button>
          )}
          {showClose && (
            <button className="reject-btn" onClick={onClose}>
              Close Report
            </button>
          )}
          {showReject && (
            <button className="reject-btn" onClick={onClose}>
              Reject Report
            </button>
          )}
        </div>
      )}

      {isFinal && (
        <p className="status-note">
          This report is <strong>{STATUS_LABELS[report.status]}</strong>.
        </p>
      )}
    </CollapsibleItem>
  );
}

export default RescueRequestCard;
