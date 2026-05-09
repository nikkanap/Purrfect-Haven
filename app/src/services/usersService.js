import api from './api.js';

// admin only — kunin lahat ng users
export async function getAllUsers() {
  const response = await api.get('/users');
  return response.data.users;
}

// admin only - delete user
export async function deleteUser(userId) {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
}