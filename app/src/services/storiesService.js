import api from './api.js';

// helper — i-build ang FormData with text fields at photos.
// ginagamit ng story endpoints na nag-a-accept ng files.
function buildFormData(textFields, photoFiles = []) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(textFields)) {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  }
  for (const file of photoFiles) {
    formData.append('photos', file);
  }
  return formData;
}

// public
export async function getFeaturedStory() {
  const response = await api.get('/stories/featured');
  return response.data.story;
}

// adopter
export async function getMyStories() {
  const response = await api.get('/stories/me');
  return response.data.stories;
}

// adopter — submit content sa pending story request, may optional photos
export async function submitStoryContent(storyId, title, content, photoFiles = []) {
  const formData = buildFormData({ title, content }, photoFiles);
  const response = await api.put(`/stories/${storyId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// adopter — initiate sariling story, may optional photos
export async function initiateOwnStory(adoptionId, title, content, photoFiles = []) {
  const formData = buildFormData(
    { adoption_id: adoptionId, title, content },
    photoFiles
  );
  const response = await api.post('/stories/initiate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// admin
export async function getAllStories() {
  const response = await api.get('/stories');
  return response.data.stories;
}

export async function requestStoryFromAdopter(adoptionId) {
  const response = await api.post('/stories/request', {
    adoption_id: adoptionId,
  });
  return response.data;
}

// admin — gumawa ng admin-authored story, may optional photos
export async function adminCreateStory(data, photoFiles = []) {
  const formData = buildFormData(data, photoFiles);
  const response = await api.post('/stories/admin-create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function reviewStory(storyId, action, adminNote) {
  const response = await api.put(`/stories/${storyId}/review`, {
    action,
    admin_note: adminNote,
  });
  return response.data;
}

export async function unpublishStory(storyId) {
  const response = await api.put(`/stories/${storyId}/unpublish`);
  return response.data;
}