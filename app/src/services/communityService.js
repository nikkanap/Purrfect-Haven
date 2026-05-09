import api from './api.js';

export async function getMyCommunityPosts() {
  const response = await api.get('/community/me');
  return response.data.posts;
}

export async function updateCommunityPostStatus(postId, status, adminNote = null) {
  const response = await api.put(`/community/${postId}/status`, {
    status,
    admin_note: adminNote,
  });
  return response.data;
}