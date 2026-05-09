// profile dashboard — adoptions, welfare checks, stories, photo uploads.

import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getMyAdoptions,
  getAllAdoptions,
  updateAdoptionStatus,
  requestWelfareCheck,
  getAdminWelfareChecks,
  listPostAdoptionUpdates,
  listWelfareChecks,
  createPostAdoptionUpdate,
} from '../services/adoptionsService.js';
import {
  getMyStories,
  getAllStories,
  submitStoryContent,
  initiateOwnStory,
} from '../services/storiesService.js';
import api from '../services/api.js';
import { updateCommunityPostStatus } from '../services/communityService.js';
import PhotoUploader from '../components/PhotoUploader.jsx';
import CollapsibleItem, { CollapsibleGroup } from '../components/CollapsibleItem.jsx';
import { getMyRescueReports, updateRescueReportStatus } from '../services/rescueService.js';
import AdoptionRequestCard from './admin/AdoptionRequestCard.jsx';
import CommunityPostCard from './admin/CommunityPostCard.jsx';
import RescueReportCard from './admin/RescueRequestCard.jsx';
import { getAllUsers, deleteUser } from '../services/usersService.js';
import '../styles/admin.css';
import '../styles/dashboard.css';

import { getPhotoUrl as buildPhotoUrl } from '../utils/photoUrl.js';
const getPhotoUrl = (filePath) => buildPhotoUrl(filePath, 'https://placehold.co/120x120?text=No+Photo');

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

function getStatusLabel(status) {
  const labels = {
    pending: 'Pending Review',
    appointment_scheduled: 'Appointment Scheduled',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
  };
  return labels[status] || status;
}

function getConditionLabel(condition) {
  const labels = {
    excellent: 'Excellent', good: 'Good',
    concerning: 'Concerning', critical: 'Critical',
  };
  return labels[condition] || condition;
}

function getStoryStatusLabel(status) {
  const labels = {
    pending:   'Awaiting your story',
    submitted: 'Under admin review',
    published: 'Published',
    rejected:  'Not published',
  };
  return labels[status] || status;
}

function DashboardPage() {
  const { user } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [stories, setStories] = useState([]);
  const [rescueReports, setRescueReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedAdoption, setExpandedAdoption] = useState(null);
  const [expandedStory, setExpandedStory] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);

  const [usersSearch, setUsersSearch] = useState('');
  const [userDeleteConfirm, setUserDeleteConfirm] = useState(null);

  const USERS_PER_PAGE = 5;
  const [usersPage, setUsersPage] = useState(1);

  // Admin state
  const [adminAdoptions, setAdminAdoptions]       = useState([]);
  const [adminPosts, setAdminPosts]               = useState([]);
  const [adminRescues, setAdminRescues]           = useState([]);
  const [adminStories, setAdminStories]           = useState([]);
  const [adminWelfareChecks, setAdminWelfareChecks] = useState([]);
  const [activeTab, setActiveTab]           = useState('adoptions');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [adminUsers, setAdminUsers] = useState([]);

  const [storyModal, setStoryModal]                 = useState(null);
  const [updateModal, setUpdateModal]               = useState(null);
  const [shareStoryModal, setShareStoryModal]       = useState(null);
  const [adoptionActionModal, setAdoptionActionModal] = useState(null);
  const [communityActionModal, setCommunityActionModal] = useState(null);
  const [rescueActionModal, setRescueActionModal] = useState(null);
  const [storyActionModal, setStoryActionModal] = useState(null);
  const [actionSubmitting, setActionSubmitting]       = useState(false);
  const [toast, setToast]                             = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.is_admin) {
      loadAdminData();
    } else {
      loadAll();
    }
  }, [user?.user_id]);

  useEffect(() => {
    setUsersPage(1);
    setUsersSearch('');
  }, [activeTab]);

  async function loadAll() {
    const [a, s, r] = await Promise.allSettled([
      getMyAdoptions(),
      getMyStories(),
      getMyRescueReports(),
    ]);

    if (a.status === 'fulfilled') setAdoptions(a.value);
    else console.error('Adoptions load failed:', a.reason);

    if (s.status === 'fulfilled') setStories(s.value);
    else console.error('Stories load failed:', s.reason);

    if (r.status === 'fulfilled') setRescueReports(r.value);
    else console.error('Rescue requests load failed:', r.reason);

    if (a.status === 'rejected') {
      setError('Could not load your adoption requests.');
    }

    setLoading(false);
  }

  async function loadAdminData() {
    setLoading(true);
    try {
      const ads = await getAllAdoptions();
      setAdminAdoptions(ads || []);
    } catch (e) { console.error('Admin adoptions failed:', e); }

    try {
      const res = await api.get('/rescue');
      setAdminRescues(res.data.reports || []);
    } catch (e) { console.error('Admin rescues failed:', e); }

    try {
      const commRes = await api.get('/community');
      setAdminPosts(commRes.data.posts || []);
    } catch (e) { console.error('Admin community posts failed:', e); }

    try {
      const s = await getAllStories();
      setAdminStories(s || []);
    } catch (e) { console.error('Admin stories failed:', e); }

    try {
      const wc = await getAdminWelfareChecks();
      setAdminWelfareChecks(wc || []);
    } catch (e) { console.error('Admin welfare checks failed:', e); }

    try {
      const u = await getAllUsers();
      setAdminUsers(u || []);
    } catch (e) { console.error('Admin users failed:', e); }

    setLoading(false);
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function showToast(message, kind = 'success') {
    setToast({ message, kind });
  }

  // ============ admin adoption actions ============

  function openAdoptionAction(request, type) {
    setAdoptionActionModal({ type, request, note: '', date: '' });
  }

  async function confirmAdoptionAction() {
    if (!adoptionActionModal) return;
    const { type, request, note, date } = adoptionActionModal;

    const statusMap = {
      schedule:     'appointment_scheduled',
      under_review: 'under_review',
      approve:      'approved',
      reject:       'rejected',
      complete:     'completed',
    };

    const extras = {};
    if (type === 'schedule')                     extras.appointment_date = date;
    if (type === 'approve' || type === 'reject') extras.decision_note = note || null;

    setActionSubmitting(true);
    try {
      await updateAdoptionStatus(request.adoption_id, statusMap[type], extras);
      setAdminAdoptions((prev) =>
        prev.map((a) =>
          a.adoption_id === request.adoption_id
            ? {
                ...a,
                status: statusMap[type],
                ...(type === 'schedule' ? { appointment_date: date } : {}),
                ...(type === 'approve' || type === 'reject'
                  ? { decision_note: note || null }
                  : {}),
              }
            : a
        )
      );
      setAdoptionActionModal(null);
      showToast('Adoption status updated successfully.');
    } catch (err) {
      console.error('Adoption action error:', err);
      showToast(err.response?.data?.error || 'Failed to update adoption status.', 'error');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleRequestWelfareCheck(adoptionId) {
    try {
      await requestWelfareCheck(adoptionId);
      showToast('Welfare check requested. The adopter will be notified.');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to request welfare check.', 'error');
    }
  }

  // ============ admin community post actions ============

  function openCommunityAction(post, type) {
    setCommunityActionModal({ type, post, note: '' });
  }

  async function confirmCommunityAction() {
    if (!communityActionModal) return;
    const { type, post, note } = communityActionModal;
    const status = type === 'approve' ? 'approved' : 'rejected';

    setActionSubmitting(true);
    try {
      await updateCommunityPostStatus(post.post_id, status, note || null);
      setAdminPosts((prev) =>
        prev.map((p) =>
          p.post_id === post.post_id
            ? { ...p, status, admin_note: note || null }
            : p
        )
      );
      setCommunityActionModal(null);
      showToast(
        type === 'approve'
          ? 'Post approved and published.'
          : 'Post rejected.'
      );
    } catch (err) {
      console.error('Community post action error:', err);
      showToast(err.response?.data?.error || 'Failed to update post status.', 'error');
    } finally {
      setActionSubmitting(false);
    }
  }

  // ============ admin rescue request actions ============

  function openRescueAction(report, type) {
    setRescueActionModal({ type, report, note: '' });
  }

  // ============ admin story actions ============

function openStoryAction(story, type) {
  setStoryActionModal({ type, story, note: '' });
}

async function confirmStoryAction() {
  if (!storyActionModal) return;
  const { type, story, note } = storyActionModal;

  setActionSubmitting(true);
  try {
    // tatawag sa PUT /api/stories/:id/review (action: publish | reject)
    await api.put(`/stories/${story.story_id}/review`, {
      action: type,
      admin_note: note || null,
    });

    // i-update ang local state agad — kaya re-render kahit hindi nag-refetch
    setAdminStories((prev) =>
      prev.map((s) =>
        s.story_id === story.story_id
          ? {
              ...s,
              status: type === 'publish' ? 'published' : 'rejected',
              admin_note: note || null,
            }
          : s
      )
    );

    setStoryActionModal(null);
    showToast(
      type === 'publish' ? 'Story published successfully.' : 'Story rejected.'
    );
  } catch (err) {
    console.error('Story action error:', err);
    showToast(err.response?.data?.error || 'Failed to update story.', 'error');
  } finally {
    setActionSubmitting(false);
  }
}

  async function confirmRescueAction() {
    if (!rescueActionModal) return;
    const { type, report, note } = rescueActionModal;

    const statusMap = {
      dispatch: 'in_progress',
      resolve:  'resolved',
      close:    'closed',
    };
    const status = statusMap[type];

    setActionSubmitting(true);
    try {
      await updateRescueReportStatus(report.report_id, status, note || null);
      setAdminRescues((prev) =>
        prev.map((r) =>
          r.report_id === report.report_id
            ? { ...r, status, admin_note: note || null }
            : r
        )
      );
      setRescueActionModal(null);
      showToast('Rescue requests updated successfully.');
    } catch (err) {
      console.error('Rescue action error:', err);
      showToast(err.response?.data?.error || 'Failed to update rescue requests.', 'error');
    } finally {
      setActionSubmitting(false);
    }
  }

  function refreshAdoption(adoptionId) {
    setAdoptions((prev) =>
      prev.map((a) =>
        a.adoption_id === adoptionId
          ? { ...a, _refreshKey: (a._refreshKey || 0) + 1 }
          : a
      )
    );
  }

  // ============ admin user actions ============

  async function confirmUserDelete() {
    if (!userDeleteConfirm) return;

    setActionSubmitting(true);
    try {
      await deleteUser(userDeleteConfirm.user_id);
      // tanggalin sa local state — para hindi na kailangan mag-refetch
      setAdminUsers((prev) =>
        prev.filter((u) => u.user_id !== userDeleteConfirm.user_id)
      );
      setUserDeleteConfirm(null);
      showToast(`${userDeleteConfirm.first_name} ${userDeleteConfirm.last_name} has been removed.`);
    } catch (err) {
      console.error('Delete user error:', err);
      showToast(err.response?.data?.error || 'Failed to delete user.', 'error');
    } finally {
      setActionSubmitting(false);
    }
  }

  // ============ admin helpers ============

  const filteredAdminAdoptions = useMemo(
    () => statusFilter === 'all' ? adminAdoptions : adminAdoptions.filter(a => a.status === statusFilter),
    [adminAdoptions, statusFilter]
  );
  const filteredAdminPosts = useMemo(
    () => statusFilter === 'all' ? adminPosts : adminPosts.filter(p => p.status === statusFilter),
    [adminPosts, statusFilter]
  );
  const filteredAdminRescues = useMemo(
    () => statusFilter === 'all' ? adminRescues : adminRescues.filter(r => r.status === statusFilter),
    [adminRescues, statusFilter]
  );

  const pendingAdoptionsCount = adminAdoptions.filter(a =>
    ['pending', 'appointment_scheduled', 'under_review'].includes(a.status)
  ).length;
  const pendingRescuesCount = adminRescues.filter(r =>
    ['pending', 'in_progress'].includes(r.status)
  ).length;
  const pendingPostsCount   = adminPosts.filter(p => p.status === 'pending').length;
  const submittedStoriesCount = adminStories.filter(s =>
    ['pending'].includes(s.status)
  ).length;
  const pendingWelfareCount    = adminWelfareChecks.filter(w => w.status === 'pending').length;

  // ============ story request response ============
  function openStoryModal(story) {
    setStoryModal({
      storyId: story.story_id,
      petName: story.pet.name,
      title:   '',
      content: '',
      photos:  [],
    });
  }

  function updateStoryField(field, value) {
    setStoryModal((prev) => ({ ...prev, [field]: value }));
  }

  async function submitStoryResponse() {
    if (!storyModal || !storyModal.title.trim() || !storyModal.content.trim()) return;
    try {
      await submitStoryContent(
        storyModal.storyId,
        storyModal.title,
        storyModal.content,
        storyModal.photos
      );
      setStories((prev) =>
        prev.map((s) =>
          s.story_id === storyModal.storyId
            ? {
                ...s,
                status: 'submitted',
                title: storyModal.title,
                content: storyModal.content,
                submitted_at: new Date().toISOString(),
              }
            : s
        )
      );
      setStoryModal(null);
    } catch (err) {
      console.error('Story submit error:', err);
      alert(err.response?.data?.error || 'Failed to submit story.');
    }
  }

  // ============ adopter-initiated story ============

  function openShareStoryModal(adoption) {
    setShareStoryModal({
      adoptionId: adoption.adoption_id,
      petName:    adoption.pet.name,
      title:      '',
      content:    '',
      photos:     [],
    });
  }

  function updateShareStoryField(field, value) {
    setShareStoryModal((prev) => ({ ...prev, [field]: value }));
  }

  async function submitOwnStory() {
    if (!shareStoryModal || !shareStoryModal.title.trim() || !shareStoryModal.content.trim()) return;
    try {
      const result = await initiateOwnStory(
        shareStoryModal.adoptionId,
        shareStoryModal.title,
        shareStoryModal.content,
        shareStoryModal.photos
      );
      const newStory = {
        story_id:     result.story_id,
        title:        shareStoryModal.title,
        content:      shareStoryModal.content,
        status:       'submitted',
        was_requested: false,
        submitted_at: new Date().toISOString(),
        adoption_id:  shareStoryModal.adoptionId,
        pet:          { pet_id: null, name: shareStoryModal.petName },
        photos:       [],
      };
      setStories((prev) => [newStory, ...prev]);
      setShareStoryModal(null);
    } catch (err) {
      console.error('Share story error:', err);
      alert(err.response?.data?.error || 'Failed to submit story.');
    }
  }

  // ============ post-adoption update ============

  function openUpdateModal(adoption) {
    setUpdateModal({
      adoptionId: adoption.adoption_id,
      petName:    adoption.pet.name,
      text:       '',
    });
  }

  async function submitUpdate() {
    if (!updateModal || !updateModal.text.trim()) return;
    try {
      await createPostAdoptionUpdate(updateModal.adoptionId, updateModal.text);
      refreshAdoption(updateModal.adoptionId);
      setUpdateModal(null);
    } catch (err) {
      console.error('Update share error:', err);
      alert(err.response?.data?.error || 'Failed to share update.');
    }
  }

  if (!user) return null;
  if (user.is_admin) {
    return (
      <div className="profile-container">
        <section className="profile-header">
          <div>
            <h1>Hello, {user.first_name}!</h1>
            <p>Welcome back to your Admin Dashboard.</p>
          </div>
        </section>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            {/* Remove side bar label  <p className="admin-sidebar-label">Admin</p> */}
            <button
              className={`admin-sidebar-item ${activeTab === 'adoptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('adoptions')}
            >
              <span>Adoption Requests</span>
              {pendingAdoptionsCount > 0 && <span className="tab-badge">{pendingAdoptionsCount}</span>}
            </button>

            <button
              className={`admin-sidebar-item ${activeTab === 'welfare' ? 'active' : ''}`}
              onClick={() => setActiveTab('welfare')}
            >
              <span>Welfare Checks</span>
              {pendingWelfareCount > 0 && <span className="tab-badge">{pendingWelfareCount}</span>}
            </button>

            <button
              className={`admin-sidebar-item ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              <span>Community Posts</span>
              {pendingPostsCount > 0 && <span className="tab-badge">{pendingPostsCount}</span>}
            </button>
            <button
              className={`admin-sidebar-item ${activeTab === 'rescues' ? 'active' : ''}`}
              onClick={() => setActiveTab('rescues')}
            >
              <span>Rescue Requests</span>
              {pendingRescuesCount > 0 && <span className="tab-badge">{pendingRescuesCount}</span>}
            </button>
            <button
              className={`admin-sidebar-item ${activeTab === 'stories' ? 'active' : ''}`}
              onClick={() => setActiveTab('stories')}
            >
              <span>Stories</span>
              {submittedStoriesCount > 0 && <span className="tab-badge">{submittedStoriesCount}</span>}
            </button>

            <button
              className={`admin-sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span>Users</span>
            </button>

          </aside>

          <div className="admin-main">
            <div className="admin-main-header">
              <h2 className="admin-main-title">
                {{ adoptions: 'Adoption Requests', community: 'Community Posts', rescues: 'Rescue Requests', stories: 'Stories', welfare: 'Welfare Checks', users: 'Users' }[activeTab]}
              </h2>
              <AutoSizeSelect
                className="admin-tab-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={activeTab === 'stories' || activeTab === 'welfare' || activeTab === 'users'}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="appointment_scheduled">Appointment Scheduled</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </AutoSizeSelect>
            </div>

            <CollapsibleGroup>

              <div className="admin-cards">
                {activeTab === 'community' && filteredAdminPosts.map(post => (
                  <CommunityPostCard
                    key={post.post_id}
                    post={post}
                    onApprove={() => openCommunityAction(post, 'approve')}
                    onReject={() => openCommunityAction(post, 'reject')}
                  />
                ))}
                {activeTab === 'rescues' && filteredAdminRescues.map(report => (
                  <RescueReportCard
                    key={report.report_id}
                    report={report}
                    onDispatch={() => openRescueAction(report, 'dispatch')}
                    onResolve={() => openRescueAction(report, 'resolve')}
                    onClose={() => openRescueAction(report, 'close')}
                  />
                ))}
                {activeTab === 'adoptions' && (filteredAdminAdoptions || []).map(request => (
                  <AdoptionRequestCard
                    key={request.adoption_id}
                    request={request}
                    onScheduleAppointment={() => openAdoptionAction(request, 'schedule')}
                    onMarkUnderReview={() => openAdoptionAction(request, 'under_review')}
                    onApprove={() => openAdoptionAction(request, 'approve')}
                    onReject={() => openAdoptionAction(request, 'reject')}
                    onComplete={() => openAdoptionAction(request, 'complete')}
                    onRequestWelfareCheck={() => handleRequestWelfareCheck(request.adoption_id)}
                  />
                ))}
                {activeTab === 'welfare' && adminWelfareChecks.map((check) => (
                  <WelfareCheckCard key={check.check_id} check={check} />
                ))}
                {activeTab === 'stories' &&
                  adminStories
                    .filter((s) => s.status === 'submitted')
                    .map((story) => (
                      <StoryReviewCard
                        key={story.story_id}
                        story={story}
                        onPublish={() => openStoryAction(story, 'publish')}
                        onReject={() => openStoryAction(story, 'reject')}
                      />
                    ))}
                  
                  {activeTab === 'users' && (() => {
                    // i-filter muna based sa search query
                    const q = usersSearch.trim().toLowerCase();
                    const filtered = q
                      ? adminUsers.filter((u) => {
                          const haystack = `${u.first_name} ${u.last_name} ${u.email} ${u.cell_num} ${u.city}`.toLowerCase();
                          return haystack.includes(q);
                        })
                      : adminUsers;

                    // tapos i-paginate ang filtered list
                    const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
                    const start = (usersPage - 1) * USERS_PER_PAGE;
                    const paginated = filtered.slice(start, start + USERS_PER_PAGE);

                    return (
                      <>
                        <div className="admin-search-wrapper">
                          <input
                            type="text"
                            className="admin-search-input"
                            placeholder="Search by name, email, phone, or city..."
                            value={usersSearch}
                            onChange={(e) => {
                              setUsersSearch(e.target.value);
                              setUsersPage(1); // bumalik sa page 1 kapag may bagong search
                            }}
                          />
                          {usersSearch && (
                            <button
                              className="admin-search-clear"
                              onClick={() => {
                                setUsersSearch('');
                                setUsersPage(1);
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {filtered.length === 0 ? (
                          <p className="empty-state">
                            No users match "{usersSearch}".
                          </p>
                        ) : (
                          <>
                            {paginated.map((u) => (
                              <UserCard
                                key={u.user_id}
                                user={u}
                                onDelete={setUserDeleteConfirm}
                                currentUserId={user.user_id}
                              />
                            ))}
                            <Pagination
                              currentPage={usersPage}
                              totalPages={totalPages}
                              onPageChange={setUsersPage}
                            />
                          </>
                        )}
                      </>
                    );
                  })()}
                {loading && <p className="empty-state">Loading...</p>}
                {!loading && activeTab === 'adoptions' && filteredAdminAdoptions.length === 0 && (
                  <p className="empty-state">No adoption requests found.</p>
                )}
                {!loading && activeTab === 'community' && filteredAdminPosts.length === 0 && (
                  <p className="empty-state">No community posts found.</p>
                )}
                {!loading && activeTab === 'rescues' && filteredAdminRescues.length === 0 && (
                  <p className="empty-state">No rescue requests found.</p>
                )}
                {!loading && activeTab === 'welfare' && adminWelfareChecks.length === 0 && (
                  <p className="empty-state">No welfare checks yet.</p>
                )}
                {!loading && activeTab === 'stories' &&
                  adminStories.filter((s) => s.status === 'submitted').length === 0 && (
                    <p className="empty-state">No stories awaiting review.</p>
                )}
                {!loading && activeTab === 'users' && adminUsers.length === 0 && (
                  <p className="empty-state">No registered users yet.</p>
                )}
              </div>
              
            </CollapsibleGroup>
          </div>
        </div>

        {adoptionActionModal && (
          <AdoptionActionModal
            modal={adoptionActionModal}
            onChangeField={(field, value) =>
              setAdoptionActionModal((prev) => ({ ...prev, [field]: value }))
            }
            onConfirm={confirmAdoptionAction}
            onCancel={() => setAdoptionActionModal(null)}
            isSubmitting={actionSubmitting}
          />
        )}

        {communityActionModal && (
          <CommunityActionModal
            modal={communityActionModal}
            onChangeField={(field, value) =>
              setCommunityActionModal((prev) => ({ ...prev, [field]: value }))
            }
            onConfirm={confirmCommunityAction}
            onCancel={() => setCommunityActionModal(null)}
            isSubmitting={actionSubmitting}
          />
        )}

        {rescueActionModal && (
          <RescueActionModal
            modal={rescueActionModal}
            onChangeField={(field, value) =>
              setRescueActionModal((prev) => ({ ...prev, [field]: value }))
            }
            onConfirm={confirmRescueAction}
            onCancel={() => setRescueActionModal(null)}
            isSubmitting={actionSubmitting}
          />
        )}

        {storyActionModal && (
          <StoryActionModal
            modal={storyActionModal}
            onChangeField={(field, value) =>
              setStoryActionModal((prev) => ({ ...prev, [field]: value }))
            }
            onConfirm={confirmStoryAction}
            onCancel={() => setStoryActionModal(null)}
            isSubmitting={actionSubmitting}
          />
        )}

        {toast && (
          <div className={`toast toast-${toast.kind}`}>{toast.message}</div>
        )}

        {userDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setUserDeleteConfirm(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h2>Delete User</h2>
              <p className="modal-subtext">
                Are you sure you want to delete{' '}
                <strong>{userDeleteConfirm.first_name} {userDeleteConfirm.last_name}</strong>?
                This cannot be undone.
              </p>

              <p className="modal-confirm-text">
                Email: <strong>{userDeleteConfirm.email}</strong>
              </p>

              <div className="modal-actions">
                <button
                  className="modal-cancel"
                  onClick={() => setUserDeleteConfirm(null)}
                  disabled={actionSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="reject-btn"
                  onClick={confirmUserDelete}
                  disabled={actionSubmitting}
                >
                  {actionSubmitting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="profile-container">
      <section className="profile-header">
        <div>
          <h1>Hello, {user.first_name}!</h1>
          <p>Welcome back to your User Dashboard.</p>
        </div>
      </section>

      <section className="profile-dashboard">
        <div className="dashboard-card dashboard-card-wide">
          <h2>My Adoption Requests</h2>

          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : error ? (
            <p className="empty-state">{error}</p>
          ) : adoptions.length === 0 ? (
            <p className="empty-state">
              No adoption requests yet.{' '}
              <Link to="/pets" className="inline-link">Browse pets</Link> to get started.
            </p>
          ) : (
            <div className="dashboard-list">
              {adoptions.map((app) => (
                <ApplicationItem
                  key={app.adoption_id}
                  application={app}
                  isExpanded={expandedAdoption === app.adoption_id}
                  onToggle={() =>
                    setExpandedAdoption((prev) =>
                      prev === app.adoption_id ? null : app.adoption_id
                    )
                  }
                  onShareUpdate={() => openUpdateModal(app)}
                  onShareStory={() => openShareStoryModal(app)}
                  storiesForThisAdoption={stories.filter(
                    (s) => s.adoption_id === app.adoption_id
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>My Stories</h2>
          {stories.length === 0 ? (
            <p className="empty-state">No stories submitted yet.</p>
          ) : (
            <div className="dashboard-list">
              {stories.map((s) => (
                <StoryItem
                  key={s.story_id}
                  story={s}
                  onWriteStory={openStoryModal}
                  isExpanded={expandedStory === s.story_id}
                  onToggle={() =>
                    setExpandedStory((prev) =>
                      prev === s.story_id ? null : s.story_id
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>My Rescue Requests</h2>
          {rescueReports.length === 0 ? (
            <p className="empty-state">No rescue requests yet.</p>
          ) : (
            <div className="dashboard-list">
              {rescueReports.map((r) => (
                <RescueReportItem
                  key={r.report_id}
                  report={r}
                  isExpanded={expandedReport === r.report_id}
                  onToggle={() =>
                    setExpandedReport((prev) =>
                      prev === r.report_id ? null : r.report_id
                    )
                  }
                />
              ))}
              
            </div>
          )}
        </div>
      </section>

      {storyModal && (
        <StoryWriteModal
          modal={storyModal}
          onChangeField={updateStoryField}
          onConfirm={submitStoryResponse}
          onCancel={() => setStoryModal(null)}
          isResponse={true}
        />
      )}

      {shareStoryModal && (
        <StoryWriteModal
          modal={shareStoryModal}
          onChangeField={updateShareStoryField}
          onConfirm={submitOwnStory}
          onCancel={() => setShareStoryModal(null)}
          isResponse={false}
        />
      )}

      {updateModal && (
        <div className="modal-overlay" onClick={() => setUpdateModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Share an Update</h2>
            <p className="modal-subtext">
              How is <strong>{updateModal.petName}</strong> doing?
            </p>
            <label className="modal-label">
              Your Update
              <textarea
                value={updateModal.text}
                onChange={(e) =>
                  setUpdateModal((prev) => ({ ...prev, text: e.target.value }))
                }
                placeholder="Share milestones, fun moments, or anything you'd like the foster home to know..."
                rows={5}
              />
            </label>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setUpdateModal(null)}>
                Cancel
              </button>
              <button
                className="approve-btn"
                onClick={submitUpdate}
                disabled={!updateModal.text.trim()}
              >
                Share Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// =====================================================
// ApplicationItem
// =====================================================
function ApplicationItem({
  application, isExpanded, onToggle,
  onShareUpdate, onShareStory,
  storiesForThisAdoption,
}) {
  const {
    pet, status, date_applied,
    appointment_date, decision_note,
    motivation, financial_capability,
    applicant_address, owns_home,
    is_first_pet, has_experience, has_other_pets, has_children,
    _refreshKey,
  } = application;

  const [updates, setUpdates] = useState([]);
  const [checks, setChecks] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    if (!isExpanded || status !== 'completed') return;

    async function fetchTimeline() {
      setTimelineLoading(true);
      try {
        const [u, c] = await Promise.all([
          listPostAdoptionUpdates(application.adoption_id),
          listWelfareChecks(application.adoption_id),
        ]);
        setUpdates(u);
        setChecks(c);
      } catch (err) {
        console.error('Failed to load timeline:', err);
      } finally {
        setTimelineLoading(false);
      }
    }
    fetchTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, status, _refreshKey]);

  const completedChecks = checks.filter((c) => c.status === 'completed');

  const timeline = [
    ...updates.map((u) => ({ type: 'update', date: u.date_posted, data: u })),
    ...completedChecks.map((c) => ({ type: 'check', date: c.responded_at, data: c })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const hasExistingStory = storiesForThisAdoption.length > 0;

  const highlight =
    status === 'appointment_scheduled' && appointment_date ? (
      <>Appointment: <strong>{formatDateTime(appointment_date)}</strong></>
    ) : null;

  return (
    <CollapsibleItem
      photo={getPhotoUrl(pet.photo)}
      photoAlt={pet.name}
      title={pet.name}
      statusLabel={getStatusLabel(status)}
      statusClass={`status-${status}`}
      meta={`${pet.breed || pet.species_name} · Applied ${formatDate(date_applied)}`}
      highlight={highlight}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {(status === 'approved' || status === 'rejected') && decision_note && (
        <div className="detail-section">
          <h4>Decision Note from Foster Home</h4>
          <p className="detail-quote">"{decision_note}"</p>
        </div>
      )}

      {status === 'completed' && (
        <div className="detail-section">
          <div className="timeline-header">
            <h4>Welfare & Updates Timeline</h4>
            <div className="timeline-actions">
              <button
                className="share-update-btn"
                onClick={(e) => { e.stopPropagation(); onShareUpdate(); }}
              >
                Share Update
              </button>
              {!hasExistingStory && (
                <button
                  className="share-story-btn"
                  onClick={(e) => { e.stopPropagation(); onShareStory(); }}
                >
                  Share Story
                </button>
              )}
            </div>
          </div>

          {timelineLoading ? (
            <p className="empty-state">Loading timeline...</p>
          ) : timeline.length === 0 ? (
            <p className="empty-state">
              No activity yet — share your first update for {pet.name}.
            </p>
          ) : (
            <div className="timeline">
              {timeline.map((entry) => (
                <TimelineEntry
                  key={`${entry.type}-${entry.data.update_id || entry.data.check_id}`}
                  entry={entry}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="detail-section">
        <h4>Your Motivation</h4>
        <p>"{motivation}"</p>
      </div>

      <div className="detail-section">
        <h4>Financial Capability</h4>
        <p>"{financial_capability}"</p>
      </div>

      <div className="detail-section">
        <h4>Application Details</h4>
        <p><strong>Address:</strong> {applicant_address}</p>
        <p><strong>Home Ownership:</strong> {owns_home ? 'Owns home' : 'Renting/leasing'}</p>
      </div>

      <div className="detail-section">
        <h4>Your Checklist</h4>
        <ul className="detail-checklist">
          <li>{is_first_pet ? 'Yes' : 'No'} — First pet</li>
          <li>{has_experience ? 'Yes' : 'No'} — Has pet care experience</li>
          <li>{has_other_pets ? 'Yes' : 'No'} — Has other pets at home</li>
          <li>{has_children ? 'Yes' : 'No'} — Has children at home</li>
        </ul>
      </div>
    </CollapsibleItem>
  );
}

// =====================================================
// TimelineEntry
// =====================================================
function TimelineEntry({ entry }) {
  if (entry.type === 'update') {
    const u = entry.data;
    return (
      <div className="timeline-entry timeline-entry-update">
        <div className="timeline-entry-header">
          <span className="timeline-entry-author">You shared</span>
          <span className="timeline-entry-date">{formatDate(u.date_posted)}</span>
        </div>
        <p>{u.update_text}</p>
      </div>
    );
  }

  const c = entry.data;
  return (
    <div className="timeline-entry timeline-entry-check">
      <div className="timeline-entry-header">
        <span className="timeline-entry-author">Welfare check (you reported)</span>
        <span className="timeline-entry-date">{formatDate(c.responded_at)}</span>
      </div>
      <p className={`condition-label condition-${c.condition_status}`}>
        Condition: {getConditionLabel(c.condition_status)}
      </p>
      <p>{c.notes}</p>

      {c.photos && c.photos.length > 0 && (
        <div className="timeline-photos">
          {c.photos.map((photo, i) => (
            <a key={i} href={getPhotoUrl(photo)} target="_blank" rel="noopener noreferrer">
              <img src={getPhotoUrl(photo)} alt={`Photo ${i + 1}`} />
            </a>
          ))}
        </div>
      )}

      <p className="timeline-entry-meta">Requested by {c.admin_name}</p>
    </div>
  );
}

// =====================================================
// StoryItem
// =====================================================
function StoryItem({ story, onWriteStory, isExpanded, onToggle }) {
  const meta =
    story.status === 'submitted' ? `Submitted ${formatDate(story.submitted_at)}` :
    story.status === 'published'  ? `Published ${formatDate(story.published_at)}` :
    null;

  return (
    <CollapsibleItem
      title={story.title || `Story for ${story.pet.name}`}
      statusLabel={getStoryStatusLabel(story.status)}
      statusClass={`story-status-${story.status}`}
      meta={meta}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {story.status === 'pending' ? (
        <div className="detail-section">
          <p>
            You've been invited to share your adoption story for{' '}
            <strong>{story.pet.name}</strong>.
          </p>
          <button
            className="share-story-btn"
            style={{ marginTop: '10px' }}
            onClick={(e) => { e.stopPropagation(); onWriteStory(story); }}
          >
            Write Story
          </button>
        </div>
      ) : (
        <>
          {story.content && (
            <div className="view-story-content">
              <p>{story.content}</p>
            </div>
          )}
          {story.photos && story.photos.length > 0 && (
            <div className="view-story-photos">
              {story.photos.map((photo, i) => (
                <a key={i} href={getPhotoUrl(photo)} target="_blank" rel="noopener noreferrer">
                  <img src={getPhotoUrl(photo)} alt={`Photo ${i + 1}`} />
                </a>
              ))}
            </div>
          )}
          <div className="view-story-meta">
            {story.status === 'submitted' && (
              <p>Submitted on {formatDate(story.submitted_at)}. Awaiting admin review.</p>
            )}
            {story.status === 'published' && (
              <p>Published on {formatDate(story.published_at)}.</p>
            )}
            {story.status === 'rejected' && story.admin_note && (
              <div className="view-story-rejection">
                <h4>Admin Note</h4>
                <p>{story.admin_note}</p>
              </div>
            )}
          </div>
        </>
      )}
    </CollapsibleItem>
  );
}

// =====================================================
// RescueReportItem
// =====================================================

function getRescueStatusLabel(status) {
  const labels = {
    pending:     'Pending Review',
    in_progress: 'In Progress',
    resolved:    'Resolved',
    closed:      'Closed',
  };
  return labels[status] || status;
}

function RescueReportItem({ report, isExpanded, onToggle }) {
  const parseDescription = (desc) => {
    const lines = desc.split('\n');
    lines.pop();
    const details = [];
    
    lines.map((line) => {
      const cleaned = line.replaceAll('*', '').trim();
      const splitLines = cleaned.split(':');
      details.push(
        {
          property: splitLines[0],
          value: splitLines[1]
        }
      )
    });

    return details;
  };

  const details = parseDescription(report.description);
  const conditionStart = report.description.indexOf('**Condition & Description:**');
  const condition = conditionStart !== -1
    ? report.description.substring(conditionStart).replace('**Condition & Description:**', '').trim()
    : 'Not provided';

  return (
    <CollapsibleItem
      title={report.location}
      statusLabel={getRescueStatusLabel(report.status)}
      statusClass={`rescue-status-${report.status}`}
      meta={`Reported ${formatDate(report.date_reported)}`}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="detail-section">
        {details.map(detail => 
          (
            <div className="detail-section">
              <h4>{detail.property}</h4>
              <p>{detail.value}</p>
            </div>
          )
        )}
        <p>{condition}</p>
      </div>

      {(report.status === 'resolved' || report.status === 'closed') && report.date_resolved && (
        <div className="view-story-meta">
          <p>{getRescueStatusLabel(report.status)} on {formatDate(report.date_resolved)}.</p>
        </div>
      )}

      {report.admin_note && (
        <div className="view-story-meta">
          <div className="view-story-rejection">
            <h4>Admin Note</h4>
            <p>{report.admin_note}</p>
          </div>
        </div>
      )}
    </CollapsibleItem>
  );
}

// StoryWriteModal
// =====================================================
function StoryWriteModal({ modal, onChangeField, onConfirm, onCancel, isResponse }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-box-large" onClick={(e) => e.stopPropagation()}>
        <h2>{isResponse ? 'Write Your Story' : 'Share Your Story'}</h2>
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
          <button className="modal-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="approve-btn"
            onClick={onConfirm}
            disabled={!modal.title.trim() || !modal.content.trim()}
          >
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// WelfareCheckCard — admin view of a single welfare check
// =====================================================
const CONDITION_LABELS = {
  excellent: 'Excellent',
  good:      'Good',
  concerning:'Concerning',
  critical:  'Critical',
};

function WelfareCheckCard({ check }) {
  const isPending = check.status === 'pending';

  return (
    <CollapsibleItem
      wrapperClassName={`admin-card status-${check.status}`}
      headerClassName="card-header card-header-gradient"
      titleContainerClassName="card-header-text"
      contentClassName="card-content"
      TitleTag="h2"
      title={`Welfare Check — ${check.pet.name}`}
      meta={`Adopter: ${check.adopter.full_name} · Requested ${formatDate(check.requested_at)}`}
      statusLabel={isPending ? 'Awaiting Response' : 'Response Received'}
      statusClass={isPending ? 'status-pending' : 'status-completed'}
    >
      <div className="card-grid card-grid-two">
        <div className="info-section">
          <h3 className="section-title">PET & ADOPTER</h3>
          <div className="detail-item">
            <h4>Pet</h4>
            <p>{check.pet.name}</p>
          </div>
          <div className="detail-item">
            <h4>Adopter</h4>
            <p>{check.adopter.full_name}</p>
          </div>
          <div className="detail-item">
            <h4>Email</h4>
            <p>{check.adopter.email}</p>
          </div>
        </div>

        <div className="info-section">
          <h3 className="section-title">CHECK DETAILS</h3>
          <div className="detail-item">
            <h4>Requested</h4>
            <p>{formatDate(check.requested_at)}</p>
          </div>
          {!isPending && (
            <>
              <div className="detail-item">
                <h4>Responded</h4>
                <p>{formatDate(check.responded_at)}</p>
              </div>
              <div className="detail-item">
                <h4>Condition</h4>
                <p className={`condition-label condition-${check.condition_status}`}>
                  {CONDITION_LABELS[check.condition_status] || check.condition_status}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {!isPending && check.notes && (
        <div className="info-section" style={{ marginTop: '14px' }}>
          <h3 className="section-title">ADOPTER NOTES</h3>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: 'var(--color-text-primary)' }}>
            {check.notes}
          </p>
        </div>
      )}

      {!isPending && check.photos.length > 0 && (
        <div className="info-section" style={{ marginTop: '14px' }}>
          <h3 className="section-title">PHOTOS</h3>
          <div className="post-photos">
            {check.photos.map((photo, i) => (
              <a key={i} href={getPhotoUrl(photo)} target="_blank" rel="noopener noreferrer">
                <img src={getPhotoUrl(photo)} alt={`Welfare photo ${i + 1}`} />
              </a>
            ))}
          </div>
        </div>
      )}

      {isPending && (
        <p className="status-note">Waiting for adopter to submit their response.</p>
      )}
    </CollapsibleItem>
  );
}

// =====================================================
// AutoSizeSelect — resizes to fit the selected option
// =====================================================
function AutoSizeSelect({ value, onChange, disabled, className, children }) {
  const selectRef = useRef(null);
  const spanRef   = useRef(null);

  useEffect(() => {
    if (!selectRef.current || !spanRef.current) return;
    const opt = Array.from(selectRef.current.options).find((o) => o.value === value);
    if (!opt) return;
    spanRef.current.textContent = opt.text;
    selectRef.current.style.width = Math.max(spanRef.current.offsetWidth + 10, 80) + 'px';
  }, [value]);

  return (
    <>
      <span
        ref={spanRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: 'inherit',
          padding: '10px 30px 10px 14px',
          pointerEvents: 'none',
        }}
      />
      <select
        ref={selectRef}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={className}
      >
        {children}
      </select>
    </>
  );
}

// =====================================================
// RescueActionModal
// =====================================================
function RescueActionModal({ modal, onChangeField, onConfirm, onCancel, isSubmitting }) {
  const config = {
    dispatch: {
      title:       'Approve & Dispatch',
      confirmText: 'Approve & Dispatch',
      btnClass:    'approve-btn',
      description: 'A rescue team will be dispatched to the reported location.',
    },
    resolve: {
      title:       'Mark as Resolved',
      confirmText: 'Mark as Resolved',
      btnClass:    'approve-btn',
      description: 'This marks the rescue operation as successfully completed.',
    },
    close: {
      title:       modal.report?.status === 'pending' ? 'Reject Report' : 'Close Report',
      confirmText: modal.report?.status === 'pending' ? 'Reject Report' : 'Close Report',
      btnClass:    'reject-btn',
      description:
        modal.report?.status === 'pending'
          ? 'The report will be rejected and the reporter will be notified.'
          : 'The rescue request will be closed without resolution.',
    },
  };

  const c = config[modal.type] || {};

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>{c.title}</h2>
        <p className="modal-subtext">
          Report at <strong>{modal.report?.location}</strong> by{' '}
          <strong>{modal.report?.reporter_name}</strong>
        </p>

        <p className="modal-confirm-text">{c.description}</p>

        <label className="modal-label">
          Admin Note{' '}
          <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span>
          <textarea
            value={modal.note}
            onChange={(e) => onChangeField('note', e.target.value)}
            placeholder="Leave a note for the reporter (optional)..."
            rows={3}
          />
        </label>

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className={c.btnClass}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : c.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// CommunityActionModal
// =====================================================
function CommunityActionModal({ modal, onChangeField, onConfirm, onCancel, isSubmitting }) {
  const isApprove = modal.type === 'approve';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>{isApprove ? 'Approve Post' : 'Reject Post'}</h2>
        <p className="modal-subtext">
          Community post for <strong>{modal.post.pet_name}</strong> by{' '}
          <strong>{modal.post.poster?.full_name}</strong>
        </p>

        <label className="modal-label">
          Admin Note{' '}
          <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span>
          <textarea
            value={modal.note}
            onChange={(e) => onChangeField('note', e.target.value)}
            placeholder={
              isApprove
                ? 'Optional message to the poster...'
                : 'Reason for rejection (optional)...'
            }
            rows={4}
          />
        </label>

        {isApprove && (
          <p className="modal-confirm-text">
            Approving this post will publish it to the community listings.
          </p>
        )}

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className={isApprove ? 'approve-btn' : 'reject-btn'}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isApprove ? 'Approve & Publish' : 'Reject Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// AdoptionActionModal
// =====================================================
function AdoptionActionModal({ modal, onChangeField, onConfirm, onCancel, isSubmitting }) {
  const titles = {
    schedule:     'Schedule Appointment',
    under_review: 'Mark as Under Review',
    approve:      'Approve Adoption',
    reject:       'Reject Application',
    complete:     'Mark as Completed',
  };

  const confirmLabels = {
    schedule:     'Schedule',
    under_review: 'Mark as Under Review',
    approve:      'Approve',
    reject:       'Reject',
    complete:     'Mark as Completed',
  };

  const confirmBtnClass = modal.type === 'reject' ? 'reject-btn' : 'approve-btn';
  const isDisabled = (modal.type === 'schedule' && !modal.date) || isSubmitting;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>{titles[modal.type]}</h2>
        <p className="modal-subtext">
          For <strong>{modal.request.pet?.name}</strong> — applicant:{' '}
          <strong>{modal.request.applicant?.full_name}</strong>
        </p>

        {modal.type === 'schedule' && (
          <label className="modal-label">
            Appointment Date & Time <span style={{ color: '#A52828' }}>*</span>
            <input
              type="datetime-local"
              value={modal.date}
              onChange={(e) => onChangeField('date', e.target.value)}
            />
          </label>
        )}

        {(modal.type === 'approve' || modal.type === 'reject') && (
          <label className="modal-label">
            Decision Note{' '}
            <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span>
            <textarea
              value={modal.note}
              onChange={(e) => onChangeField('note', e.target.value)}
              placeholder={
                modal.type === 'approve'
                  ? 'Optional message to the applicant...'
                  : 'Reason for rejection (optional)...'
              }
              rows={4}
            />
          </label>
        )}

        {modal.type === 'under_review' && (
          <p className="modal-confirm-text">
            This moves the application to <strong>Under Review</strong>, indicating
            the appointment is complete and you are now evaluating the applicant.
          </p>
        )}

        {modal.type === 'complete' && (
          <p className="modal-confirm-text">
            This marks the adoption as <strong>Completed</strong>, confirming the pet
            has been claimed. The pet will be marked as adopted and removed from the
            available listings.
          </p>
        )}

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className={confirmBtnClass}
            onClick={onConfirm}
            disabled={isDisabled}
          >
            {isSubmitting ? 'Saving...' : confirmLabels[modal.type]}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// StoryReviewCard — admin view ng isang submitted story
// =====================================================
function StoryReviewCard({ story, onPublish, onReject }) {
  const isDecided = story.status !== 'submitted';

  return (
    <CollapsibleItem
      wrapperClassName={`admin-card status-${story.status}`}
      headerClassName="card-header card-header-gradient"
      titleContainerClassName="card-header-text"
      contentClassName="card-content"
      TitleTag="h2"
      title={story.title || `Story for ${story.pet.name}`}
      meta={`By ${story.adopter_name} · About ${story.pet.name} · Submitted ${formatDate(story.submitted_at)}`}
      statusLabel={getStoryStatusLabel(story.status)}
      statusClass={`story-status-${story.status}`}
    >
      {/* mismong laman ng story */}
      <div className="info-section">
        <h3 className="section-title">STORY CONTENT</h3>
        <p style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: 1.6 }}>
          {story.content}
        </p>
      </div>

      {/* mga photos kung meron */}
      {story.photos && story.photos.length > 0 && (
        <div className="info-section" style={{ marginTop: '14px' }}>
          <h3 className="section-title">PHOTOS</h3>
          <div className="story-card-photos">
            {story.photos.map((photo, i) => (
              <a key={i} href={getPhotoUrl(photo)} target="_blank" rel="noopener noreferrer">
                <img src={getPhotoUrl(photo)} alt={`Story photo ${i + 1}`} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* lalabas lang ang note kapag na-decide na */}
      {isDecided && story.admin_note && (
        <div className="info-section" style={{ marginTop: '14px' }}>
          <h3 className="section-title">ADMIN NOTE</h3>
          <p className="story-admin-note">{story.admin_note}</p>
        </div>
      )}

      {/* approve/reject buttons — submitted lang */}
      {!isDecided && (
        <div className="action-buttons">
          <button className="approve-btn" onClick={onPublish}>
            Publish Story
          </button>
          <button className="reject-btn" onClick={onReject}>
            Reject Story
          </button>
        </div>
      )}
    </CollapsibleItem>
  );
}

// =====================================================
// StoryActionModal — confirm dialog para sa publish/reject
// =====================================================
function StoryActionModal({ modal, onChangeField, onConfirm, onCancel, isSubmitting }) {
  const isPublish = modal.type === 'publish';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>{isPublish ? 'Publish Story' : 'Reject Story'}</h2>
        <p className="modal-subtext">
          Story by <strong>{modal.story.adopter_name}</strong> about{' '}
          <strong>{modal.story.pet.name}</strong>
        </p>

        <label className="modal-label">
          Admin Note{' '}
          <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span>
          <textarea
            value={modal.note}
            onChange={(e) => onChangeField('note', e.target.value)}
            placeholder={
              isPublish
                ? 'Optional message to the adopter...'
                : 'Reason for rejection (optional)...'
            }
            rows={4}
          />
        </label>

        {isPublish && (
          <p className="modal-confirm-text">
            Publishing will make this story eligible to appear as the Featured
            Story on the homepage.
          </p>
        )}

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className={isPublish ? 'approve-btn' : 'reject-btn'}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isPublish ? 'Publish Story' : 'Reject Story'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserCard({ user, onDelete, currentUserId }) {
  const fullName = `${user.first_name} ${user.last_name}`;
  const joined = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // huwag pakitaan ng delete button kung admin o sarili
  const canDelete = user.is_admin !== 1 && user.user_id !== currentUserId;

  return (
    <div className="admin-card user-card">
      <div className="user-card-content">
        <div className="user-card-identity">
          <h2 style={{ margin: 0 }}>
            {fullName}
            {user.is_admin === 1 && (
              <span className="meta-tag" style={{ marginLeft: '10px' }}>Admin</span>
            )}
          </h2>
          <p className="user-card-meta" style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            Joined {joined}
          </p>
        </div>

        <div className="user-card-contact">
          <p style={{ margin: '4px 0', fontSize: '13px' }}>
            <strong>Email:</strong> {user.email}
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>
            <strong>Phone:</strong> {user.cell_num}
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>
            <strong>Location:</strong> {user.city}
          </p>
        </div>

        {canDelete && (
          <div className="user-card-actions">
            <button
              className="reject-btn small-btn"
              onClick={() => onDelete(user)}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Pagination — reusable component para sa simple paging.
// nawawala kapag isa lang o wala talagang page.
// =====================================================
function Pagination({ currentPage, totalPages, onPageChange }) {
  // walang ipapakita kung isa lang ang page
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Prev
      </button>
      <span className="pagination-info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  );
}

export default DashboardPage;