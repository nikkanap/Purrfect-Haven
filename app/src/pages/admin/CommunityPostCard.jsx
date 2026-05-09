import CollapsibleItem from '../../components/CollapsibleItem.jsx';

const STATUS_LABELS = {
  pending:  'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

function CommunityPostCard({ post, onApprove, onReject }) {
  const isDecided = post.status !== 'pending';

  return (
    <CollapsibleItem
      wrapperClassName={`admin-card status-${post.status}`}
      headerClassName="card-header card-header-gradient"
      titleContainerClassName="card-header-text"
      contentClassName="card-content"
      TitleTag="h2"
      title={`${post.pet_name} at ${post.location}`}
      meta={`Posted by ${post.poster.full_name} on ${post.date_posted}`}
      statusLabel={STATUS_LABELS[post.status] || post.status}
      statusClass={`status-${post.status}`}
    >
      <div className="card-grid card-grid-two">
        {/* REPORT CONTENT */}
        <div className="info-section">
          <h3 className="section-title">POST CONTENT</h3>

          <div className="detail-item">
            <h4>Pet Name</h4>
            <p>{post.pet_name}</p>
          </div>

          <div className="detail-item">
            <h4>Animal Type</h4>
            <p>{post.species_name}</p>
          </div>

          <div className="detail-item">
            <h4>Weight (kg)</h4>
            <p>{post.weight || 'N/A'}</p>
          </div>

          <div className="detail-item">
            <h4>Breed</h4>
            <p>{post.breed || 'N/A'}</p>
          </div>

          <div className="detail-item">
            <h4>Age</h4>
            <p>{post.age || 'N/A'}</p>
          </div>

          <div className="detail-item">
            <h4>Gender</h4>
            <p>{post.sex || 'N/A'}</p>
          </div>

          <div className="detail-item">
            <h4>Color/Pattern</h4>
            <p>{post.color || 'N/A'}</p>
          </div>

          <div className="detail-item">
            <h4>Personality</h4>
            <p>{post.personality || 'N/A'}</p>
          </div>

          <div className="detail-item">
            <h4>Organization/Foster Home</h4>
            <p>{post.organization || 'N/A'}</p>
          </div>

          <div className="detail-item">
            <h4>Health & Care</h4>
            <p>{post.health || 'N/A'}</p>
          </div>

          <div className="detail-item">
            <h4>About The Pet</h4>
            <p style={{ whiteSpace: 'pre-wrap' }}>{post.description}</p>
          </div>
        </div>

        {/* POSTED BY */}
        <div className="info-section">
          <h3 className="section-title">POSTED BY</h3>

          <div className="detail-item">
            <h4>Full Name</h4>
            <p>{post.poster.full_name}</p>
          </div>

          <div className="detail-item">
            <h4>Location Reported</h4>
            <p>{post.location}</p>
          </div>

          <div className="detail-item">
            <h4>Contact Info</h4>
            <p>{post.poster.cell_num}</p>
            <p>{post.poster.email}</p>
          </div>

        </div>
      </div>

      {!isDecided && (
        <div className="action-buttons">
          <button className="approve-btn" onClick={onApprove}>
            Approve & Publish
          </button>
          <button className="reject-btn" onClick={onReject}>
            Reject Post
          </button>
        </div>
      )}
    </CollapsibleItem>
  );
}

export default CommunityPostCard;
