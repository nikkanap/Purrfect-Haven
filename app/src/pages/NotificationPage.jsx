import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PhotoUploader from '../components/PhotoUploader.jsx';
import {
  getMyPendingWelfareChecks,
  respondToWelfareCheck,
  getMyAdoptions,
} from '../services/adoptionsService.js';
import {
  getMyStories,
  submitStoryContent,
} from '../services/storiesService.js';
import { getMyCommunityPosts } from '../services/communityService.js';
import { getMyRescueReports } from '../services/rescueService.js';
import '../styles/admin.css';
import '../styles/dashboard.css';

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getConditionLabel(condition) {
  const labels = {
    excellent: 'Excellent',
    good: 'Good',
    concerning: 'Concerning',
    critical: 'Critical',
  };
  return labels[condition] || condition;
}

// Derive notification banners from adoption status.
// Only show statuses that changed past "pending" — things the admin decided.
function adoptionBanners(adoptions) {
  return adoptions
    .filter((a) => a.status !== 'pending')
    .map((a) => {
      const pet = a.pet?.name || 'your pet';
      switch (a.status) {
        case 'appointment_scheduled':
          return {
            key: `adoption-${a.adoption_id}`,
            kind: 'info',
            heading: 'Appointment Scheduled',
            body: `Your adoption appointment for ${pet} is scheduled.`,
            detail: a.appointment_date ? `Date: ${formatDateTime(a.appointment_date)}` : null,
          };
        case 'under_review':
          return {
            key: `adoption-${a.adoption_id}`,
            kind: 'info',
            heading: 'Application Under Review',
            body: `Your adoption application for ${pet} is currently under review.`,
            detail: null,
          };
        case 'approved':
          return {
            key: `adoption-${a.adoption_id}`,
            kind: 'success',
            heading: 'Adoption Approved',
            body: `Your adoption application for ${pet} has been approved!`,
            detail: a.decision_note ? `Note: "${a.decision_note}"` : null,
          };
        case 'rejected':
          return {
            key: `adoption-${a.adoption_id}`,
            kind: 'rejected',
            heading: 'Application Rejected',
            body: `Your adoption application for ${pet} was not approved.`,
            detail: a.decision_note ? `Note: "${a.decision_note}"` : null,
          };
        case 'completed':
          return {
            key: `adoption-${a.adoption_id}`,
            kind: 'success',
            heading: 'Adoption Completed',
            body: `Your adoption of ${pet} is now complete. Welcome to the family!`,
            detail: null,
          };
        default:
          return null;
      }
    })
    .filter(Boolean);
}

// Derive notification banners from rescue request status.
function rescueBanners(reports) {
  return reports
    .filter((r) => r.status !== 'pending')
    .map((r) => {
      switch (r.status) {
        case 'in_progress':
          return {
            key:     `rescue-${r.report_id}`,
            kind:    'info',
            heading: 'Rescue Team Dispatched',
            body:    `Your rescue request at ${r.location} has been approved. A team is on the way.`,
            detail:  r.admin_note ? `Note: "${r.admin_note}"` : null,
          };
        case 'resolved':
          return {
            key:     `rescue-${r.report_id}`,
            kind:    'success',
            heading: 'Rescue Request Resolved',
            body:    `The rescue operation at ${r.location} has been successfully completed.`,
            detail:  r.admin_note ? `Note: "${r.admin_note}"` : null,
          };
        case 'closed':
          return {
            key:     `rescue-${r.report_id}`,
            kind:    'rejected',
            heading: 'Rescue Request Closed',
            body:    `Your rescue request at ${r.location} has been closed.`,
            detail:  r.admin_note ? `Note: "${r.admin_note}"` : null,
          };
        default:
          return null;
      }
    })
    .filter(Boolean);
}

// Derive notification banners from community post status.
function communityBanners(posts) {
  return posts
    .filter((p) => p.status === 'approved' || p.status === 'rejected')
    .map((p) => ({
      key: `post-${p.post_id}`,
      kind: p.status === 'approved' ? 'success' : 'rejected',
      heading: p.status === 'approved' ? 'Community Post Approved' : 'Community Post Rejected',
      body:
        p.status === 'approved'
          ? `Your community post for ${p.pet_name} has been approved and is now published.`
          : `Your community post for ${p.pet_name} was not approved.`,
      detail: p.admin_note ? `Note: "${p.admin_note}"` : null,
    }));
}

function NotificationPage() {
  const { user, loading: authLoading } = useAuth();
  const [pendingChecks, setPendingChecks] = useState([]);
  const [stories, setStories] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [rescueReports, setRescueReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [welfareModal, setWelfareModal] = useState(null);
  const [storyModal, setStoryModal] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    async function loadNotifications() {
      setLoading(true);
      setError('');

      const [checksResult, storiesResult, adoptionsResult, postsResult, rescueResult] =
        await Promise.allSettled([
          getMyPendingWelfareChecks(),
          getMyStories(),
          getMyAdoptions(),
          getMyCommunityPosts(),
          getMyRescueReports(),
        ]);

      if (checksResult.status === 'fulfilled') {
        setPendingChecks(checksResult.value || []);
      } else {
        console.error('Pending welfare checks failed:', checksResult.reason);
        setError('Unable to load your notifications right now.');
      }

      if (storiesResult.status === 'fulfilled') {
        setStories(storiesResult.value || []);
      } else {
        console.error('Story requests failed:', storiesResult.reason);
        setError('Unable to load your notifications right now.');
      }

      if (adoptionsResult.status === 'fulfilled') {
        setAdoptions(adoptionsResult.value || []);
      } else {
        console.error('Adoptions load failed:', adoptionsResult.reason);
      }

      if (postsResult.status === 'fulfilled') {
        setCommunityPosts(postsResult.value || []);
      } else {
        console.error('Community posts load failed:', postsResult.reason);
      }

      if (rescueResult.status === 'fulfilled') {
        setRescueReports(rescueResult.value || []);
      } else {
        console.error('Rescue requests load failed:', rescueResult.reason);
      }

      setLoading(false);
    }

    loadNotifications();
  }, [authLoading, user?.user_id]);

  const pendingStoryRequests = useMemo(
    () => stories.filter((story) => story.status === 'pending'),
    [stories]
  );

  const updateBanners = useMemo(
    () => [
      ...adoptionBanners(adoptions),
      ...communityBanners(communityPosts),
      ...rescueBanners(rescueReports),
    ],
    [adoptions, communityPosts, rescueReports]
  );

  function openWelfareModal(check) {
    setWelfareModal({
      checkId: check.check_id,
      petName: check.pet_name,
      adoptionId: check.adoption_id,
      condition: 'good',
      notes: '',
      photos: [],
    });
  }

  function updateWelfareField(field, value) {
    setWelfareModal((prev) => ({ ...prev, [field]: value }));
  }

  async function submitWelfareResponse() {
    if (!welfareModal || !welfareModal.notes.trim()) return;

    setActionSubmitting(true);
    try {
      await respondToWelfareCheck(
        welfareModal.checkId,
        welfareModal.condition,
        welfareModal.notes,
        welfareModal.photos
      );
      setPendingChecks((prev) =>
        prev.filter((check) => check.check_id !== welfareModal.checkId)
      );
      setWelfareModal(null);
    } catch (err) {
      console.error('Welfare response error:', err);
      setError(err.response?.data?.error || 'Failed to submit welfare response.');
    } finally {
      setActionSubmitting(false);
    }
  }

  function openStoryModal(story) {
    setStoryModal({
      storyId: story.story_id,
      petName: story.pet.name,
      title: '',
      content: '',
      photos: [],
    });
  }

  function updateStoryField(field, value) {
    setStoryModal((prev) => ({ ...prev, [field]: value }));
  }

  async function submitStoryResponse() {
    if (!storyModal || !storyModal.title.trim() || !storyModal.content.trim()) return;

    setActionSubmitting(true);
    try {
      await submitStoryContent(
        storyModal.storyId,
        storyModal.title,
        storyModal.content,
        storyModal.photos
      );
      setStories((prev) =>
        prev.map((story) =>
          story.story_id === storyModal.storyId
            ? {
                ...story,
                status: 'submitted',
                title: storyModal.title,
                content: storyModal.content,
                submitted_at: new Date().toISOString(),
              }
            : story
        )
      );
      setStoryModal(null);
    } catch (err) {
      console.error('Story submit error:', err);
      setError(err.response?.data?.error || 'Failed to submit story.');
    } finally {
      setActionSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="profile-container">
        <section className="profile-header">
          <div>
            <h1>Notifications</h1>
            <p>Loading your pending actions...</p>
          </div>
        </section>
        <p className="empty-state">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <section className="profile-header">
          <div>
            <h1>Notifications</h1>
            <p>Please sign in to view your notifications.</p>
          </div>
          <Link to="/login" className="profile-settings-link">
            Sign In
          </Link>
        </section>
      </div>
    );
  }

  const hasActionItems = pendingChecks.length > 0 || pendingStoryRequests.length > 0;
  const hasUpdateItems = updateBanners.length > 0;

  return (
    <div className="profile-container">
      <section className="profile-header">
        <div>
          <h1>Notifications</h1>
          <p>Action required items and updates for your adoption journey.</p>
        </div>
      </section>

      {error && <p className="empty-state">{error}</p>}

      {hasActionItems && (
        <section className="action-required-section">
          <h2>Action Required</h2>

          {pendingChecks.map((check) => (
            <div key={`wc-${check.check_id}`} className="action-banner action-banner-urgent">
              <div className="action-banner-content">
                <h3>Welfare Check Required</h3>
                <p>
                  Please complete a welfare check for <strong>{check.pet_name}</strong>.
                  As per our adoption terms, this is mandatory.
                </p>
                <p className="action-banner-meta">
                  Requested {formatDate(check.requested_at)}
                </p>
              </div>
              <button className="action-banner-btn" onClick={() => openWelfareModal(check)}>
                Complete Welfare Check
              </button>
            </div>
          ))}

          {pendingStoryRequests.map((story) => (
            <div key={`sr-${story.story_id}`} className="action-banner action-banner-info">
              <div className="action-banner-content">
                <h3>Story Request</h3>
                <p>
                  Our team has invited you to share your adoption story for{' '}
                  <strong>{story.pet.name}</strong>.
                </p>
                <p className="action-banner-meta">
                  Requested {formatDate(story.submitted_at)}
                </p>
              </div>
              <button className="action-banner-btn" onClick={() => openStoryModal(story)}>
                Write Story
              </button>
            </div>
          ))}
        </section>
      )}

      {hasUpdateItems && (
        <section className="action-required-section">
          <h2>Updates</h2>

          {updateBanners.map((banner) => (
            <div
              key={banner.key}
              className={`action-banner action-banner-${
                banner.kind === 'success'
                  ? 'success'
                  : banner.kind === 'rejected'
                  ? 'rejected'
                  : 'info'
              }`}
            >
              <div className="action-banner-content">
                <h3>{banner.heading}</h3>
                <p>{banner.body}</p>
                {banner.detail && (
                  <p className="action-banner-meta">{banner.detail}</p>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {!hasActionItems && !hasUpdateItems && (
        <p className="empty-state">No pending notifications right now.</p>
      )}

      {welfareModal && (
        <WelfareResponseModal
          modal={welfareModal}
          onChangeField={updateWelfareField}
          onConfirm={submitWelfareResponse}
          onCancel={() => setWelfareModal(null)}
          isSubmitting={actionSubmitting}
        />
      )}

      {storyModal && (
        <StoryWriteModal
          modal={storyModal}
          onChangeField={updateStoryField}
          onConfirm={submitStoryResponse}
          onCancel={() => setStoryModal(null)}
          isSubmitting={actionSubmitting}
        />
      )}
    </div>
  );
}

function WelfareResponseModal({ modal, onChangeField, onConfirm, onCancel, isSubmitting }) {
  const conditions = ['excellent', 'good', 'concerning', 'critical'];

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-box-large" onClick={(e) => e.stopPropagation()}>
        <h2>Welfare Check</h2>
        <p className="modal-subtext">
          Tell us how <strong>{modal.petName}</strong> is doing.
        </p>

        <label className="modal-label">
          Pet's Current Condition
          <div className="condition-options">
            {conditions.map((condition) => (
              <button
                key={condition}
                type="button"
                className={`condition-pill condition-${condition} ${
                  modal.condition === condition ? 'selected' : ''
                }`}
                onClick={() => onChangeField('condition', condition)}
              >
                {getConditionLabel(condition)}
              </button>
            ))}
          </div>
        </label>

        <label className="modal-label">
          Notes
          <textarea
            value={modal.notes}
            onChange={(e) => onChangeField('notes', e.target.value)}
            placeholder="How is your pet adjusting? Any health concerns? Daily routines, milestones, anything you want to share..."
            rows={5}
          />
        </label>

        <PhotoUploader
          files={modal.photos}
          onChange={(files) => onChangeField('photos', files)}
          maxFiles={5}
          label="Photos (Optional)"
        />

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="approve-btn"
            onClick={onConfirm}
            disabled={isSubmitting || !modal.notes.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Welfare Check'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StoryWriteModal({ modal, onChangeField, onConfirm, onCancel, isSubmitting }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-box-large" onClick={(e) => e.stopPropagation()}>
        <h2>Write Your Story</h2>
        <p className="modal-subtext">
          About <strong>{modal.petName}</strong>
        </p>

        <label className="modal-label">
          Story Title
          <input
            type="text"
            value={modal.title}
            onChange={(e) => onChangeField('title', e.target.value)}
            placeholder='e.g. "Henhen changed our lives"'
          />
        </label>

        <label className="modal-label">
          Your Story
          <textarea
            value={modal.content}
            onChange={(e) => onChangeField('content', e.target.value)}
            placeholder="Tell us about your adoption journey — how you met your pet, the early days, how life is now..."
            rows={8}
          />
        </label>

        <PhotoUploader
          files={modal.photos}
          onChange={(files) => onChangeField('photos', files)}
          maxFiles={8}
          label="Photos (Optional)"
        />

        <p className="modal-confirm-text">
          Your story will be reviewed by our team before being published. Once
          approved, it may appear as the Featured Story on our homepage.
        </p>

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="approve-btn"
            onClick={onConfirm}
            disabled={isSubmitting || !modal.title.trim() || !modal.content.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationPage;