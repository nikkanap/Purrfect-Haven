import api from './api.js';

// =====================================================
// adoption applications
// =====================================================

export async function submitAdoptionApplication(data) {
  const response = await api.post('/adoptions', data);
  return response.data;
}

export async function getMyAdoptions() {
  const response = await api.get('/adoptions/me');
  return response.data.applications;
}

export async function getAllAdoptions() {
  const response = await api.get('/adoptions');
  return response.data.applications;
}

export async function updateAdoptionStatus(adoptionId, status, extras = {}) {
  const response = await api.put(`/adoptions/${adoptionId}/status`, {
    status,
    ...extras,
  });
  return response.data;
}

// =====================================================
// post-adoption updates
// =====================================================

export async function createPostAdoptionUpdate(adoptionId, updateText) {
  const response = await api.post(`/adoptions/${adoptionId}/updates`, {
    update_text: updateText,
  });
  return response.data;
}

export async function listPostAdoptionUpdates(adoptionId) {
  const response = await api.get(`/adoptions/${adoptionId}/updates`);
  return response.data.updates;
}

// =====================================================
// welfare checks
// =====================================================

export async function getAdminWelfareChecks() {
  const response = await api.get('/welfare-checks');
  return response.data.checks;
}

export async function requestWelfareCheck(adoptionId) {
  const response = await api.post(`/adoptions/${adoptionId}/welfare-checks`);
  return response.data;
}

export async function listWelfareChecks(adoptionId) {
  const response = await api.get(`/adoptions/${adoptionId}/welfare-checks`);
  return response.data.checks;
}

// adopter — sumasagot sa pending welfare check.
// gumagamit ng FormData kasi may file uploads.
export async function respondToWelfareCheck(checkId, conditionStatus, notes, photoFiles = []) {
  const formData = new FormData();
  formData.append('condition_status', conditionStatus);
  formData.append('notes', notes);

  // i-append yung mga photos — pareho lang ang field name ('photos')
  for (const file of photoFiles) {
    formData.append('photos', file);
  }

  const response = await api.put(`/welfare-checks/${checkId}/respond`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getMyPendingWelfareChecks() {
  const response = await api.get('/welfare-checks/pending');
  return response.data.pending_checks;
}